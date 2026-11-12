import { PassportService, type TokenPayload } from '@faramircinema/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PinoLogger } from 'nestjs-pino'

import type { AllConfigs } from '../../config'

@Injectable()
export class TokenService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	public constructor(
		private readonly logger: PinoLogger,
		private readonly configService: ConfigService<AllConfigs>,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL = this.configService.get('passport.accessTtl', {
			infer: true
		})
		this.REFRESH_TOKEN_TTL = this.configService.get('passport.refreshTtl', {
			infer: true
		})
	}

	public generateTokens(userId: string) {
		const payload: TokenPayload = { sub: userId }
		this.logger.info(`Generating tokens for userId=${userId}`)
		const accessToken = this.passportService.generate(
			String(payload.sub),
			this.ACCESS_TOKEN_TTL
		)

		const refreshToken = this.passportService.generate(
			String(payload.sub),
			this.REFRESH_TOKEN_TTL
		)

		this.logger.info(
			`Generated accessToken and refreshToken for userId=${userId}`
		)
		return { accessToken, refreshToken }
	}

	public verify(token: string) {
		return this.passportService.verify(token)
	}
}
