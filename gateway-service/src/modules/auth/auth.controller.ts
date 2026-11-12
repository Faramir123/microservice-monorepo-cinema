import { ConfigService } from '@nestjs/config'
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UnauthorizedException
} from '@nestjs/common'
import { SendOtpRequest } from './dto/requests/send-otp.request.js'
import { ApiOperation } from '@nestjs/swagger'
import { AuthClientGrpc } from './auth.grpc.js'
import { VerifyOtpRequest } from './dto/requests/verify-otp.request.js'
import type { Request, Response } from 'express'
import { TelegramVerifyRequest, TelegramFinalizeRequest } from './dto/index.js'

@Controller('auth')
export class AuthController {
	public constructor(
		private readonly client: AuthClientGrpc,
		private readonly configService: ConfigService
	) {}

	@ApiOperation({
		summary: 'Send otp code',
		description:
			'Sends a verification code to the user phone number ir email'
	})
	@Post('otp/send')
	@HttpCode(HttpStatus.OK)
	public async sendOtp(@Body() dto: SendOtpRequest) {
		return this.client.call('sendOtp', dto)
	}

	@ApiOperation({
		summary: 'Verify otp code',
		description:
			'Verifyes the verification code sent to the user phone number or email return access token.'
	})
	@Post('otp/verify')
	@HttpCode(HttpStatus.OK)
	public async verifyOtp(
		@Body() dto: VerifyOtpRequest,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken } = await this.client.call(
			'verifyOtp',
			dto
		)

		res.cookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure:
				this.configService.getOrThrow<string>('NODE_ENV') !==
				'development',
			domain: this.configService.getOrThrow<string>('COOKIES_DOMAIN'),
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 * 1000
		})

		return { accessToken }
	}

	@ApiOperation({
		summary: 'Refresh access token',
		description: 'Renews acces token using refresh token from cookies'
	})
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	public async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshToken = req.cookies?.refresh_token

		const { accessToken, refreshToken: newRefreshToken } =
			await this.client.call('refresh', { refreshToken })

		res.cookie('refresh_token', newRefreshToken, {
			httpOnly: true,
			secure:
				this.configService.getOrThrow<string>('NODE_ENV') !==
				'development',
			domain: this.configService.getOrThrow<string>('COOKIES_DOMAIN'),
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 * 1000
		})

		return { accessToken }
	}

	@ApiOperation({
		summary: 'Logout',
		description: 'Clears the refresh token cookie and logs the user out'
	})
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(@Res({ passthrough: true }) res: Response) {
		res.cookie('refresh_token', '', {
			httpOnly: true,
			secure:
				this.configService.getOrThrow<string>('NODE_ENV') !==
				'development',
			domain: this.configService.getOrThrow<string>('COOKIES_DOMAIN'),
			sameSite: 'lax',
			expires: new Date(0)
		})

		return { ok: true }
	}

	@Get('telegram')
	@HttpCode(HttpStatus.OK)
	public async telegramInit() {
		return this.client.call('telegramInit', {})
	}

	@Post('telegram/verify')
	@HttpCode(HttpStatus.OK)
	public async telegramVerify(
		@Body() dto: TelegramVerifyRequest,
		@Res({ passthrough: true }) res: Response
	) {
		const query = JSON.parse(atob(dto.tgAuthResult))

		const result = await this.client.call('telegramVerify', { query })

		if ('url' in result && result.url) return result

		if (result.accessToken && result.refreshToken) {
			const { accessToken, refreshToken: refreshToken } = result
			res.cookie('refresh_token', refreshToken, {
				httpOnly: true,
				secure:
					this.configService.getOrThrow<string>('NODE_ENV') !==
					'development',
				domain: this.configService.getOrThrow<string>('COOKIES_DOMAIN'),
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60 * 1000
			})

			return { accessToken }
		}

		throw new UnauthorizedException('Invalid Telegram login response')
	}

	@Post('telegram/finalize')
	@HttpCode(HttpStatus.OK)
	public async finalizeTelegramLogin(
		@Body() dto: TelegramFinalizeRequest,
		@Res({ passthrough: true }) res: Response
	) {
		const { sessionId } = dto

		const { accessToken, refreshToken } = await this.client.call(
			'telegramConsume',
			{ sessionId }
		)

		res.cookie('refresh_token', refreshToken, {
			httpOnly: true,
			secure:
				this.configService.getOrThrow<string>('NODE_ENV') !==
				'development',
			domain: this.configService.getOrThrow<string>('COOKIES_DOMAIN'),
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 * 1000
		})

		return { accessToken }
	}
}
