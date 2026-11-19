import { RpcStatus } from '@faramircinema/common'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { createHash, timingSafeEqual } from 'crypto'
import { PinoLogger } from 'nestjs-pino'
import { generateCode } from 'patcode'

import { RedisService } from '../../infrastructure/redis/redis.service.js'

const OTP_TTL_SECONDS = 300

@Injectable()
export class OtpService {
	public constructor(
		private readonly logger: PinoLogger,
		private readonly redisService: RedisService
	) {}

	public async send(identifier: string, type: 'email' | 'phone') {
		const { hash, code } = this.generate()

		this.logger.info(
			`Sending OTP code=${code} to identifier=${identifier}, type=${type}`
		)

		await this.redisService.set(
			this.key(identifier, type),
			hash,
			'EX',
			OTP_TTL_SECONDS
		)

		this.logger.info(
			`OTP stored in Redis for identifier=${identifier}, type=${type}`
		)

		return { code, hash }
	}

	public async verify(
		identifier: string,
		code: string,
		type: 'email' | 'phone'
	) {
		const storedHash = await this.redisService.get(
			this.key(identifier, type)
		)

		if (!storedHash) {
			this.logger.warn(`OTP expired or missing for ${identifier}`)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Invalid or expired OTP code'
			})
		}

		if (!this.hashesEqual(this.hashCode(code), storedHash)) {
			this.logger.warn(`OTP verification failed for ${identifier}`)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Invalid or expired OTP code'
			})
		}
		await this.redisService.del(this.key(identifier, type))
	}

	/**
	 * Сравнивает plain-код с хэшем, сохранённым в pending_contract_changes.
	 * Не бросает — возвращает boolean, чтобы AccountService сам мапил в RpcException.
	 */
	public verifyHash(plainCode: string, storedHash: string): boolean {
		if (!storedHash) {
			return false
		}

		const incomingHash = this.hashCode(plainCode)
		return this.hashesEqual(incomingHash, storedHash)
	}

	/** Best-effort удаление OTP из Redis после успешного подтверждения. */
	public async consume(
		identifier: string,
		type: 'email' | 'phone'
	): Promise<void> {
		await this.redisService.del(this.key(identifier, type))
	}

	private key(identifier: string, type: 'email' | 'phone') {
		return `otp:${type}:${identifier}`
	}

	private hashCode(code: string): string {
		return createHash('sha256').update(code).digest('hex')
	}

	private hashesEqual(a: string, b: string): boolean {
		// sha256-hex всегда 64 символа; при разной длине timingSafeEqual бросит
		if (a.length !== b.length) {
			return false
		}
		return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
	}

	private generate() {
		const code = generateCode()
		const hash = this.hashCode(code)

		this.logger.info(`Generated OTP hash=${hash}`)

		return { hash, code }
	}
}
