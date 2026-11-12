import { RpcStatus } from '@faramircinema/common'
import type {
	CreateRefoundRequest,
	ProcessRefoundEventRequest
} from '@faramircinema/contracts/gen/ts/refound'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { CurrencyEnum, YookassaService } from 'nestjs-yookassa'
import { lastValueFrom } from 'rxjs'

import { BookingClientGrpc } from '../../clients/booking.client'

import { RefoundRepository } from './refound.repository'

@Injectable()
export class RefoundService {
	public constructor(
		private readonly repository: RefoundRepository,
		private readonly yookassaService: YookassaService,
		private readonly booking: BookingClientGrpc
	) {}

	public async createRefound(data: CreateRefoundRequest) {
		const { userId, bookingId } = data

		const payment = await this.repository.findPaymentByBookingId(bookingId)

		if (!payment || payment.userId !== userId)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Payment not found'
			})

		const refound = await this.repository.createRefound({
			amount: payment.amount,
			payment: { connect: { id: payment.id } }
		})

		const ykassa = await this.yookassaService.refunds.create({
			//@ts-ignore
			amount: {
				value: payment.amount,
				currency: CurrencyEnum.RUB
			},
			payment_id: payment.providerId!
		})

		await this.repository.updateRefound(refound.id, {
			providerId: ykassa.id
		})

		return { ok: true }
	}

	public async processEvent(data: ProcessRefoundEventRequest) {
		const { event, providerRefoundId, status } = data

		const refound =
			await this.repository.findRefoundByProviderId(providerRefoundId)

		if (!refound)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Refound not found'
			})

		if (event === 'refound.succeeded') {
			try {
				await this.repository.markRefoundSuccess(refound.id)

				await this.repository.markPaymentRefound(refound.paymentId)

				await lastValueFrom(
					this.booking.cancelBooking({
						bookingId: refound.payment.bookingId,
						userId: refound.payment.userId
					})
				)

				return { ok: true }
			} catch (error) {
				throw new RpcException({
					code: RpcStatus.INTERNAL,
					details: 'Failed to process refound'
				})
			}
		}
	}
}
