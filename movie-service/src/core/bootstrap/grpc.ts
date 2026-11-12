import type { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type MicroserviceOptions, Transport } from '@nestjs/microservices'

import { grpcLoader, grpcPackages, grpcProtoPaths } from './grpc.options.js'

export function setupGrpc(app: INestApplication, config: ConfigService) {
	const host = config.get('GRPC_HOST')
	const port = config.get('GRPC_PORT')

	const url = `${host}:${port}`

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: grpcPackages,
			protoPath: grpcProtoPaths,
			url: url,
			loader: grpcLoader
		}
	})
}
