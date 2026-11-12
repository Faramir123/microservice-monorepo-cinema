import { RpcStatus } from '@faramircinema/common'
import type {
	RefreshRequest,
	SendOtpRequest,
	VerifyOtpRequest
} from '@faramircinema/contracts/gen/ts/auth.js'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { PinoLogger } from 'nestjs-pino'

import type { Account } from '../../../prisma/generated/client.js'
import { MessagingService } from '../../infrastructure/messaging/messaging.service.js'
import { UserRepository } from '../../shared/repositories/user.repository.js'
import { OtpService } from '../otp/otp.service.js'
import { TokenService } from '../token/token.service.js'
import { UsersClientGrpc } from '../users/users.grpc.js'

@Injectable()
export class AuthService {
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

		this.logger.info(
			`OTP requst recived: indetifier=${identifier}, type=${type}`
		)

		let account: Account | null

		if (type === 'phone') {
			account = await this.userRepository.findByPhone(identifier)
		} else {
			account = await this.userRepository.findByEmail(identifier)
		}

		if (!account) {
			this.logger.info(
				`Account not found for identifier=${identifier}, type=${type}. Creating new account.`
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

		console.log('CODE:', code)

		await this.messagingService.otpRequested({
			identifier,
			type,
			code: code
		})

		this.logger.info(
			`OTP sent successfully for identifier=${identifier}, type=${type}`
		)

		return { ok: true }
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { identifier, type, code } = data

		this.logger.info(
			`OTP verification request received: identifier=${identifier}, type=${type}`
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
				`OTP verified but account not found: ${identifier}`
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

		this.logger.info(`OTP fevifird successfully for ${identifier}`)

		this.usersClient.create({ id: account.id }).subscribe()

		return this.tokenService.generateTokens(account.id)
	}

	public async refresh(data: RefreshRequest) {
		const { refreshToken } = data

		this.logger.info(`Refresh token requested`)

		const result = this.tokenService.verify(refreshToken)

		if (!result.valid) {
			this.logger.warn(`Invalid refresh token: ${result.reason}`)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: result.reason
			})
		}

		this.logger.info(
			`Refresh token verified successfully for userId=${result.userId}`
		)

		return this.tokenService.generateTokens(result.userId)
	}
}
