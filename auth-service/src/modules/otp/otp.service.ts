import { RpcStatus } from '@faramircinema/common'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { createHash } from 'crypto'
import { PinoLogger } from 'nestjs-pino'
import { generateCode } from 'patcode'

import { RedisService } from '../../infrastructure/redis/redis.service.js'

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
			`otp:${type}:${identifier}`,
			hash,
			'EX',
			300
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
			`otp:${type}:${identifier}`
		)

		if (!storedHash) {
			this.logger.warn(`OTP expired or missing for ${identifier}`)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Invalid or expired OTP code'
			})
		}

		const incomingHash = createHash('sha256').update(code).digest('hex')

		if (storedHash !== incomingHash) {
			this.logger.warn(`OTP verification failed for ${identifier}`)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Invalid or expired OTP code'
			})
		}
		await this.redisService.del(`otp:${type}:${identifier}`)
	}

	private generate() {
		const code = generateCode()
		const hash = createHash('sha256').update(code).digest('hex')

		this.logger.info(`Generated OTP hash=${hash}`)

		return { hash, code }
	}
}
