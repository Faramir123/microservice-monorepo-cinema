import { convertEnum, RpcStatus } from '@faramircinema/common/dist/index.js'
import {
	type ConfirmEmailChangeRequest,
	type ConfirmPhoneChangeRequest,
	type GetAccountRequest,
	type InitEmailChangeRequest,
	type InitPhoneChangeRequest,
	Role
} from '@faramircinema/contracts/gen/ts/account.js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { PinoLogger } from 'nestjs-pino'

import { MessagingService } from '../../infrastructure/messaging/messaging.service.js'
import { UserRepository } from '../../shared/repositories/user.repository.js'

import { OtpService } from './../otp/otp.service.js'
import { AccountRepository } from './account.repository.js'

const OTP_TTL_MS = 5 * 60 * 1000

@Injectable()
export class AccountService {
	public constructor(
		private readonly logger: PinoLogger,
		private readonly accountRepository: AccountRepository,
		private readonly messagingService: MessagingService,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {}

	public async getAccount(data: GetAccountRequest) {
		const { id } = data

		this.logger.info(`Fetching account for id=${id}`)

		const account = await this.accountRepository.findById(id)

		if (!account) {
			this.logger.warn(`Account not found for id=${id}`)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found'
			})
		}

		return {
			id: account.id,
			email: account.email,
			phone: account.phone,
			isPhoneVerified: account.isPhoneVerified,
			isEmailVerified: account.isEmailVerified,
			role: convertEnum(Role, account.role)
		}
	}

	public async initEmailChange(data: InitEmailChangeRequest) {
		const { email, userId } = data

		this.logger.info(
			`Initiating email change for userId=${userId}, email=${email}`
		)

		const existing = await this.userRepository.findByEmail(email)

		if (existing) {
			this.logger.warn(`Email already in use: ${email}`)

			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Email already in use'
			})
		}

		const { code, hash } = await this.otpService.send(email, 'email')

		// 1) Сначала durable-состояние в БД
		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: 'email',
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + OTP_TTL_MS)
		})

		// 2) Только после успешной записи — уведомление
		await this.messagingService.emailChanged({ email, code })

		this.logger.info(
			`Email change initiated for userId=${userId}, email=${email}`
		)

		return { ok: true }
	}

	public async confirmEmailChange(data: ConfirmEmailChangeRequest) {
		const { email, code, userId } = data

		this.logger.info(
			`Confirming email change for userId=${userId}, email=${email}`
		)

		const pending = await this.accountRepository.findPendingChange(
			userId,
			'email'
		)

		if (!pending) {
			this.logger.warn(
				`No pending email change request for userId=${userId}`
			)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request'
			})
		}

		if (pending.value !== email) {
			this.logger.warn(
				`Email mismatch for userId=${userId}: expected=${pending.value}, received=${email}`
			)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Email mismatch'
			})
		}

		if (pending.expiresAt < new Date()) {
			this.logger.warn(
				`OTP code expired for userId=${userId}, email=${email}`
			)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired'
			})
		}

		const result = await this.accountRepository
			.applyPendingChangeAndDelete({
				accountId: userId,
				type: 'email',
				expectedValue: email, // то, что мы проверили как pending.value
				userUpdate: { email, isEmailVerified: true }
			})
			.catch(err => this.throwMappedPrismaError(err, 'email'))

		if (result.status === 'pending_missing') {
			// Кто-то (другой запрос или повторный init) уже сдвинул pending —
			// наше подтверждение не применилось. Это или replay, или гонка.
			this.logger.warn(
				`Pending email change disappeared for userId=${userId}, email=${email}`
			)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request'
			})
		}

		this.logger.info(
			`Email change confirmed for userId=${userId}, email=${email}`
		)
		return { ok: true }
	}

	public async initPhoneChange(data: InitPhoneChangeRequest) {
		const { phone, userId } = data

		this.logger.info(
			`Initiating phone change for userId=${userId}, phone=${phone}`
		)

		const existing = await this.userRepository.findByPhone(phone)

		if (existing) {
			this.logger.warn(`Phone already in use: ${phone}`)
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Phone already in use'
			})
		}

		const { code, hash } = await this.otpService.send(phone, 'phone')

		// 1) Сначала durable-состояние в БД
		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: 'phone',
			value: phone,
			codeHash: hash,
			expiresAt: new Date(Date.now() + OTP_TTL_MS)
		})

		// 2) Только после успешной записи — уведомление
		await this.messagingService.phoneChanged({ phone, code })

		this.logger.info(
			`Phone change initiated for userId=${userId}, phone=${phone}`
		)

		return { ok: true }
	}

	public async confirmPhoneChange(data: ConfirmPhoneChangeRequest) {
		const { phone, code, userId } = data

		this.logger.info(
			`Confirming phone change for userId=${userId}, phone=${phone}`
		)

		const pending = await this.accountRepository.findPendingChange(
			userId,
			'phone'
		)

		if (!pending) {
			this.logger.warn(
				`No pending phone change request for userId=${userId}`
			)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request'
			})
		}

		if (pending.value !== phone) {
			this.logger.warn(
				`Phone mismatch for userId=${userId}: expected=${pending.value}, received=${phone}`
			)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Phone mismatch'
			})
		}

		if (pending.expiresAt < new Date()) {
			this.logger.warn(
				`OTP code expired for userId=${userId}, phone=${phone}`
			)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired'
			})
		}

		const result = await this.accountRepository
			.applyPendingChangeAndDelete({
				accountId: userId,
				type: 'phone',
				expectedValue: phone, // то, что мы проверили как pending.value
				userUpdate: { phone, isPhoneVerified: true }
			})
			.catch(err => this.throwMappedPrismaError(err, 'phone'))

		if (result.status === 'pending_missing') {
			// Кто-то (другой запрос или повторный init) уже сдвинул pending —
			// наше подтверждение не применилось. Это или replay, или гонка.
			this.logger.warn(
				`Pending phone change disappeared for userId=${userId}, phone=${phone}`
			)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request'
			})
		}

		this.logger.info(
			`Phone change confirmed for userId=${userId}, phone=${phone}`
		)
		return { ok: true }
	}

	private throwMappedPrismaError(
		err: unknown,
		field: 'email' | 'phone'
	): never {
		const code = (err as { code?: string } | null)?.code

		if (code === 'P2025') {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found'
			})
		}

		if (code === 'P2002') {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details:
					field === 'email'
						? 'Email already in use'
						: 'Phone already in use'
			})
		}

		throw err
	}
}
