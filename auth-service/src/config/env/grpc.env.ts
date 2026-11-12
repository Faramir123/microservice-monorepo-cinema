import { registerAs } from '@nestjs/config'

import { validateEnv } from '../../shared/utils/index.js'
import type { GrpcConfig } from '../interfaces/index.js'
import { GrpcValidator } from '../validators/index.js'

export const grpcEnv = registerAs<GrpcConfig>('grpc', () => {
	validateEnv(process.env, GrpcValidator)

	return {
		host: process.env.GRPC_HOST,
		port: parseInt(process.env.GRPC_PORT),
		clients: {
			users: process.env.USERS_GRPC_URL
		}
	}
})
