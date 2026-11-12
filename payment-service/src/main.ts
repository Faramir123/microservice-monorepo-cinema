import { PROTO_PATHS } from '@faramircinema/contracts'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { type MicroserviceOptions, Transport } from '@nestjs/microservices'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	const url = `${config.getOrThrow('GRPC_HOST')}:${config.getOrThrow('GRPC_PORT')}`

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: ['payment.v1', 'refound.v1'],
			protoPath: [PROTO_PATHS.PAYMENT, PROTO_PATHS.REFOUND],
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
