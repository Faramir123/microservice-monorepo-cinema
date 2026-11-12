import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(RedisService.name)

	public constructor(private readonly configService: ConfigService) {
		super({
			username: configService.get('REDIS_USERNAME'),
			password: configService.get('REDIS_PASSWORD'),
			host: configService.get('REDIS_HOST'),
			port: configService.get('REDIS_PORT'),
			// db: parseInt(configService.get('REDIS_DB')),
			lazyConnect: true,
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

	public async getJson<T>(key: string): Promise<T | null> {
		const value = await this.get(key)

		return value ? (JSON.parse(value) as T) : null
	}

	public async setJson(key: string, value: unknown, ttl?: number) {
		const payload = JSON.stringify(value)

		if (ttl) await this.set(key, payload, 'EX', ttl)
		else this.set(key, payload)
	}
}
