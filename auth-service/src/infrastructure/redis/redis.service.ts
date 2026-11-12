import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

import type { AllConfigs } from '../../config'

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(RedisService.name)

	public constructor(
		private readonly configService: ConfigService<AllConfigs>
	) {
		super({
			username: configService.get('redis.username', { infer: true }),
			password: configService.get('redis.password', { infer: true }),
			host: configService.get('redis.host', { infer: true }),
			port: configService.get('redis.port', { infer: true }),
			db: configService.get('redis.db', { infer: true }),
			maxRetriesPerRequest: 5,
			enableOfflineQueue: true
		})
	}

	public async onModuleInit() {
		const start = Date.now()

		this.logger.log('Initializing redis connection...')

		this.on('connect', () => {
			this.logger.log('Connected connecting to the Redis server...')
		})

		this.on('ready', () => {
			const ms = Date.now() - start
			this.logger.log(`Redis connection is ready in ${ms}ms`)
		})

		this.on('error', error => {
			this.logger.error('Redis connection error', {
				error: error.message ?? error
			})
		})

		this.on('close', () => {
			this.logger.log('Redis connection closed')
		})

		this.on('reconnecting', () => {
			this.logger.log('Reconnecting to the Redis server...')
		})
	}

	public async onModuleDestroy() {
		this.logger.log('Closing redis connection...')

		try {
			await this.quit()
			this.logger.log('Redis connection closed')
		} catch (error) {
			this.logger.error('Failed to close redis connection', error)
		}
	}
}
