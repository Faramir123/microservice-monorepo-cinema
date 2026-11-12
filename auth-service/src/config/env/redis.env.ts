import { registerAs } from '@nestjs/config'

import { validateEnv } from '../../shared/utils/index.js'
import type { RedisConfig } from '../interfaces/index.js'
import { RedisValidator } from '../validators/index.js'

export const redisEnv = registerAs<RedisConfig>('redis', () => {
	validateEnv(process.env, RedisValidator)

	return {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT),
		password: process.env.REDIS_PASSWORD,
		username: process.env.REDIS_USERNAME,
		db: parseInt(process.env.REDIS_DB)
	}
})
