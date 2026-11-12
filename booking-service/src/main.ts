import { PROTO_PATHS } from '@faramircinema/contracts'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { type MicroserviceOptions, Transport } from '@nestjs/microservices'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	const url = `${config.get('GRPC_HOST')}:${config.get('GRPC_PORT')}`

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: ['booking.v1'],
			protoPath: [PROTO_PATHS.BOOKING],
			url: url,
			loader: {
				keepCase: false,
				longs: String,
				enums: String,
				defaults: true,
				oneofs: true
			}
		}
	})

	app.startAllMicroservices()
	app.init()
}
void bootstrap()
