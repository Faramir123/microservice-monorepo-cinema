import { RpcStatus } from '@faramircinema/common'
import type {
	TelegramCompleteRequest,
	TelegramConsumeRequest,
	TelegramVerifyRequest
} from '@faramircinema/contracts/gen/ts/auth.js'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { createHash, createHmac, randomBytes } from 'crypto'

import { UserRepository } from '../../shared/repositories/user.repository.js'
import { TokenService } from '../token/token.service.js'
import { UsersClientGrpc } from '../users/users.grpc.js'

import { RedisService } from './../../infrastructure/redis/redis.service.js'
import { TelegramRepository } from './telegram.repository.js'

@Injectable()
export class TelegramService {
	private readonly BOT_ID: string
	private readonly BOT_TOKEN: string
	private readonly BOT_USERNAME: string
	private readonly REDIRECT_ORIGIN: string

	public constructor(
		private readonly configService: ConfigService,
		private readonly telegramRepository: TelegramRepository,
		private readonly userRepository: UserRepository,
		private readonly tokenService: TokenService,
		private readonly redisService: RedisService,
		private readonly usersClient: UsersClientGrpc
	) {
		this.BOT_ID = this.configService.get<string>('telegram.botId', {
			infer: true
		})
		this.BOT_TOKEN = this.configService.get<string>('telegram.botToken', {
			infer: true
		})
		this.BOT_USERNAME = this.configService.get<string>(
			'telegram.botUsername',
			{
				infer: true
			}
		)
		this.REDIRECT_ORIGIN = this.configService.get<string>(
			'telegram.redirectOrigin',
			{
				infer: true
			}
		)
	}

	public getAuthUrl() {
		const url = new URL('https://oauth.telegram.org/auth')

		url.searchParams.append('bot_id', this.BOT_ID)
		url.searchParams.append('origin', this.REDIRECT_ORIGIN)
		url.searchParams.append('request_access', 'write')
		url.searchParams.append('return_to', this.REDIRECT_ORIGIN)

		return { url: url.href }
	}

	public async verify(data: TelegramVerifyRequest) {
		const isValid = this.checkTelegramAuth(data.query)

		if (!isValid)
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: 'Invalid Telegram signature'
			})

		// 2. Проверяем, что данные не устарели
		const authDate = Number(data.query.auth_date)

		// Текущее время в секундах (Unix timestamp)
		const now = Math.floor(Date.now() / 1000)

		// Разрешенный лимит (например, 5 минут = 300 секунд)
		const MAX_AGE_SECONDS = 300

		if (!authDate || isNaN(authDate)) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Missing or invalid auth_date'
			})
		}

		// Проверяем, не устарели ли данные
		if (now - authDate > MAX_AGE_SECONDS) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: 'Telegram auth data has expired'
			})
		}

		// Проверяем, не пришли ли данные из будущего (защита от подмены времени)
		if (authDate > now + 60) {
			// допускаем расхождение часов в 1 минуту
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Telegram auth_date is in the future'
			})
		}

		const telegramId = data.query.id
		const firstName = data.query.firstName
		const lastName = data.query.lastName
		const userName = data.query.username

		const exists =
			await this.telegramRepository.findByTelegramId(telegramId)

		if (exists && exists.phone) {
			if (
				(!!exists.firstName && exists.firstName !== firstName) ||
				(exists.lastName && exists.lastName !== lastName)
			) {
				await this.telegramRepository.update(exists.id, {
					firstName,
					lastName
				})
			}

			return this.tokenService.generateTokens(exists.id)
		}

		this.usersClient.create({ id: exists.id }).subscribe()

		const sessionId = randomBytes(16).toString('hex')

		await this.redisService.set(
			`telegram_session:${sessionId}`,
			JSON.stringify({
				telegramId,
				userName,
				firstName,
				lastName
			}),
			'EX',
			300
		)

		return { url: `https://t.me/${this.BOT_USERNAME}?start=${sessionId}` }
	}

	public async complete(data: TelegramCompleteRequest) {
		const { sessionId, phone } = data

		const raw = await this.redisService.get(`telegram_session:${sessionId}`)

		if (!raw)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Session not found'
			})

		const { telegramId } = JSON.parse(raw)

		let user = await this.userRepository.findByPhone(phone)

		if (!user) user = await this.userRepository.createAccount({ phone })

		await this.userRepository.update(user.id, {
			telegramId,
			isPhoneVerified: true
		})

		const tokens = this.tokenService.generateTokens(user.id)

		await this.redisService.set(
			`telegram_tokens:${sessionId}`,
			JSON.stringify(tokens),
			'EX',
			120
		)

		await this.redisService.del(`telegram_session:${sessionId}`)

		return { sessionId }
	}

	public async consumeSession(data: TelegramConsumeRequest) {
		const { sessionId } = data

		const raw = await this.redisService.get(`telegram_tokens:${sessionId}`)

		if (!raw)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Session not found'
			})

		const tokens = JSON.parse(raw)

		await this.redisService.del(`telegram_tokens:${sessionId}`)

		return tokens
	}

	private checkTelegramAuth(query: Record<string, string>) {
		const hash = query.hash

		if (!hash) return false

		const dataCheckArr = Object.keys(query)
			.filter(k => k !== 'hash')
			.sort()
			.map(k => `${k}=${query[k]}`)

		const dataCheckString = dataCheckArr.join('\n')

		const secretKey = createHash('sha256')
			.update(`${this.BOT_ID}:${this.BOT_TOKEN}`)
			.digest()

		const hmac = createHmac('sha256', secretKey)
			.update(dataCheckString)
			.digest('hex')

		const isValid = hmac === hash

		return isValid
	}
}
