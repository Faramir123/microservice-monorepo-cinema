import { registerAs } from '@nestjs/config'

import { validateEnv } from '../../shared/utils/index.js'
import type { PassportConfig } from '../interfaces/index.js'
import { PassportValidator } from '../validators/index.js'

export const passportEnv = registerAs<PassportConfig>('passport', () => {
	validateEnv(process.env, PassportValidator)

	return {
		secretKey: process.env.PASSPORT_SECRET_KEY,
		accessTtl: parseInt(process.env.PASSPORT_ACCESS_TTL),
		refreshTtl: parseInt(process.env.PASSPORT_REFRESH_TTL)
	}
})
