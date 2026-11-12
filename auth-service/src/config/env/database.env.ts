import { registerAs } from '@nestjs/config'

import { validateEnv } from '../../shared/utils/index.js'
import type { DatabaseConfig } from '../interfaces/index.js'
import { DatabaseValidator } from '../validators/index.js'

export const databaseEnv = registerAs<DatabaseConfig>('database', () => {
	validateEnv(process.env, DatabaseValidator)

	return {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT),
		password: process.env.DATABASE_PASSWORD,
		name: process.env.DATABASE_NAME,
		user: process.env.DATABASE_USER
	}
})
