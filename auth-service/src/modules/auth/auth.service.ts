import { RpcStatus } from '@faramircinema/common'
import type {
	RefreshRequest,
	SendOtpRequest,
	VerifyOtpRequest
} from '@faramircinema/contracts/gen/ts/auth.js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { PinoLogger } from 'nestjs-pino'
import { lastValueFrom, timeout } from 'rxjs'

import type { Account } from '../../../prisma/generated/client.js'
import { MessagingService } from '../../infrastructure/messaging/messaging.service.js'
import { UserRepository } from '../../shared/repositories/user.repository.js'
import { OtpService } from '../otp/otp.service.js'
import { TokenService } from '../token/token.service.js'
import { UsersClientGrpc } from '../users/users.grpc.js'

@Injectable()
export class AuthService {
	private static readonly USERS_GRPC_TIMEOUT_MS = 5_000

	public constructor(
		private readonly logger: PinoLogger,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly tokenService: TokenService,
		private readonly messagingService: MessagingService,
		private readonly usersClient: UsersClientGrpc
	) {
		this.logger.setContext(AuthService.name)
	}

	public async sendOtp(data: SendOtpRequest) {
		const { identifier, type } = data

		this.logger.info({ identifier, type }, 'OTP request received')

		let account: Account | null

		if (type === 'phone') {
			account = await this.userRepository.findByPhone(identifier)
		} else {
			account = await this.userRepository.findByEmail(identifier)
		}

		if (!account) {
			this.logger.info(
				{ identifier, type },
				'Account not found, creating new account'
			)

			account = await this.userRepository.createAccount({
				phone: type === 'phone' ? identifier : undefined,
				email: type === 'email' ? identifier : undefined
			})
		}

		const { code } = await this.otpService.send(
			identifier,
			type as 'email' | 'phone'
		)

		if (process.env.NODE_ENV !== 'production') {
			this.logger.debug({ identifier }, 'OTP generated (dev-only log)')
		}

		await this.messagingService.otpRequested({
			identifier,
			type,
			code
		})

		this.logger.info({ identifier, type }, 'OTP sent successfully')

		return { ok: true }
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { identifier, type, code } = data

		this.logger.info(
			{ identifier, type },
			'OTP verification request received'
		)

		await this.otpService.verify(
			identifier,
			code,
			type as 'email' | 'phone'
		)

		let account: Account | null

		if (type === 'phone') {
			account = await this.userRepository.findByPhone(identifier)
		} else {
			account = await this.userRepository.findByEmail(identifier)
		}

		if (!account) {
			this.logger.warn(
				{ identifier, type },
				'OTP verified but account not found'
			)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Account not found'
			})
		}

		if (type === 'phone' && !account.isPhoneVerified) {
			await this.userRepository.update(account.id, {
				isPhoneVerified: true
			})
		}

		if (type === 'email' && !account.isEmailVerified) {
			await this.userRepository.update(account.id, {
				isEmailVerified: true
			})
		}

		this.logger.info(
			{ accountId: account.id, identifier },
			'OTP verified successfully'
		)

		// create идемпотентен (ON CONFLICT DO NOTHING) —
		// вызываем на каждый verifyOtp. Если в прошлый раз users-service
		// лежал, досинхронизируемся здесь же.
		await this.ensureUserProfile(account.id)

		return this.tokenService.generateTokens(account.id)
	}

	public async refresh(data: RefreshRequest) {
		const { refreshToken } = data

		this.logger.info('Refresh token requested')

		const result = this.tokenService.verify(refreshToken)

		if (!result.valid) {
			this.logger.warn({ reason: result.reason }, 'Invalid refresh token')
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: result.reason
			})
		}

		this.logger.info(
			{ userId: result.userId },
			'Refresh token verified successfully'
		)

		return this.tokenService.generateTokens(result.userId)
	}

	private async ensureUserProfile(accountId: string): Promise<void> {
		try {
			await lastValueFrom(
				this.usersClient
					.create({ id: accountId })
					.pipe(timeout(AuthService.USERS_GRPC_TIMEOUT_MS))
			)
		} catch (error) {
			this.logger.error(
				{
					accountId,
					error: error instanceof Error ? error.message : error
				},
				'users-service CreateUser failed; will retry on next verifyOtp'
			)
		}
	}
}
