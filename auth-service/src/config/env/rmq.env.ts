import { registerAs } from '@nestjs/config'

import { validateEnv } from '../../shared/utils/index.js'
import type { RmqConfig } from '../interfaces/index.js'
import { RmqValidator } from '../validators/index.js'

export const rmqEnv = registerAs<RmqConfig>('rmq', () => {
	validateEnv(process.env, RmqValidator)

	return {
		url: process.env.RMQ_URL
	}
})
