import { RpcStatus } from '@faramircinema/common'
import type {
	CreatePaymentMethodRequest,
	CreatePaymentRequest,
	DeletePaymentMethodRequest,
	GetUserPaymentMethodRequest,
	ProcessPaymentEventRequest,
	VerifyPaymentMethodRequest
} from '@faramircinema/contracts/gen/ts/payment'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import {
	ConfirmationEnum,
	CurrencyEnum,
	PaymentMethodsEnum,
	YookassaService
} from 'nestjs-yookassa'
import { lastValueFrom } from 'rxjs'

import {
	type PaymentMethod,
	PaymentMethodStatus
} from '../../../prisma/generated/client'
import { BookingClientGrpc } from '../../clients/booking.client'

import { PaymentRepository } from './payment.repository'

@Injectable()
export class PaymentsService {
	private readonly HOSTS_APP: string

	public constructor(
		private readonly repository: PaymentRepository,
		private readonly configService: ConfigService,
		private readonly yookassaService: YookassaService,
		private readonly booking: BookingClientGrpc
	) {
		this.HOSTS_APP = configService.getOrThrow<string>('HOSTS_APP')
	}

	public async createPayment(data: CreatePaymentRequest) {
		const {
			seats,
			userId,
			savePaymentMethod,
			paymentMethodId,
			screeningId
		} = data

		const reservation = await lastValueFrom(
			this.booking.createReservation({
				userId,
				screeningId,
				seats
			})
		)

		const transaction = await this.repository.createPayment({
			amount: reservation.amount,
			userId,
			bookingId: reservation.orderId
		})

		let paymentMethod: PaymentMethod | null = null

		if (paymentMethodId) {
			paymentMethod =
				await this.repository.findPaymentMethodById(paymentMethodId)

			if (!paymentMethod)
				throw new RpcException({
					code: RpcStatus.NOT_FOUND,
					details: 'Saved payment method not found'
				})
		}

		const payment = await this.yookassaService.payments.create({
			amount: {
				value: transaction.amount,
				currency: CurrencyEnum.RUB
			},
			description: `Оплата билетовна сеанс ${screeningId}`,
			...(paymentMethodId
				? { payment_method_id: paymentMethod?.providerId! }
				: {
						payment_method_data: {
							type: PaymentMethodsEnum.BANK_CARD
						},
						save_payment_method: !!savePaymentMethod
					}),
			confirmation: {
				type: ConfirmationEnum.REDIRECT,
				return_url: `${this.HOSTS_APP}/account/tickets`
			},
			metadata: {
				payment_id: transaction.id,
				bookingId: reservation.orderId,
				user_id: userId
			}
		})

		await this.repository.updatePayment(transaction.id, {
			providerId: payment.id,
			metadata: JSON.stringify(payment)
		})

		return {
			url:
				//@ts-ignore
				payment.confirmation?.confirmation_url ??
				`${this.HOSTS_APP}/account/tickets/callback`
		}
	}

	public async processEvent(data: ProcessPaymentEventRequest) {
		const {
			bookingId,
			cardFirst6,
			cartLast4,
			event,
			paymentId,
			providerMethodId,
			savePaymentMethod,
			userId
		} = data

		const payment = await this.repository.findPaymentById(paymentId)

		if (!payment)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Payment not found'
			})

		if (event === 'payment.waiting_for_capture') {
			try {
				await this.yookassaService.payments.capture(payment.providerId!)
			} catch (error) {
				throw new RpcException({
					code: RpcStatus.INTERNAL,
					details: 'Failed to capture payment'
				})
			}
		}

		if (event === 'payment.success') {
			await this.repository.markPaymentSuccess(paymentId)

			if (savePaymentMethod && providerMethodId) {
				const existing = await this.repository.findActivePaymentMethod(
					userId,
					providerMethodId
				)

				if (existing) return { ok: true }

				try {
					await this.repository.createPaymentMethod({
						type: 'BANK_CARD',
						providerId: providerMethodId,
						userId,
						status: PaymentMethodStatus.ACTIVE,
						first6: cardFirst6,
						last4: cartLast4
					})
				} catch (error) {
					console.error(
						`Failed to save payment method for user ${userId}:`,
						error
					)
				}
			}

			try {
				await lastValueFrom(
					this.booking.cancelBooking({ bookingId, userId })
				)
			} catch (error) {
				console.error('Failed to call booking.confirmBooking')

				throw error
			}
		}

		if (event === 'payment.canceled') {
			await this.repository.markPaymentFailed(paymentId)
		}

		return { ok: true }
	}

	public async getUserPaymentMethods(data: GetUserPaymentMethodRequest) {
		const { userId } = data

		const methods = await this.repository.findUserPaymentMethod(userId)

		return { methods }
	}

	public async createPaymentMethod(data: CreatePaymentMethodRequest) {
		const { userId } = data

		const method = await this.repository.createPaymentMethod({
			type: 'BANK_CARD',
			userId
		})

		const yookass = await this.yookassaService.paymentMethods.create({
			confirmation: {
				type: ConfirmationEnum.REDIRECT,
				return_url: `${this.HOSTS_APP}/account/payment-methods/callback?payment_method_id=${method.id}`
			},
			type: PaymentMethodsEnum.BANK_CARD
		})

		await this.repository.updatePayment(method.id, {
			providerId: yookass.id
		})

		return { id: method.id, url: yookass.confirmation?.confirmation_url }
	}

	public async verifyPaymentMethod(data: VerifyPaymentMethodRequest) {
		const { methodId, userId } = data

		const method = await this.repository.findPaymentMethodById(methodId)

		if (!method || method.userId !== userId)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Payment method not found'
			})

		const ykassa = await this.yookassaService.paymentMethods.getById(
			method.providerId!
		)

		if (!ykassa.saved && ykassa.status !== 'active')
			throw new RpcException({
				code: RpcStatus.FAILED_PRECONDITION,
				details: 'Payment method is not active or was not saved'
			})

		await this.repository.updatePaymentMethod(method.id, {
			status: PaymentMethodStatus.ACTIVE,
			first6: ykassa.card?.first6,
			last4: ykassa.card?.last4,
			bank: ykassa.card?.card_product?.name ?? 'Unknown',
			brand: ykassa.card?.card_type
		})

		return { ok: true }
	}

	public async deletePaymentMethod(data: DeletePaymentMethodRequest) {
		const { methodId, userId } = data

		const method = await this.repository.findPaymentMethodById(methodId)

		if (!method || method.userId !== userId)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Payment method not found'
			})

		await this.repository.deletePaymentMethod(methodId)

		return { ok: true }
	}
}
