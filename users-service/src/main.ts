import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule, ObserveInstrument } from './app.module.js'
import { createGrpcServer } from './infrastructure/grpc/grpc.server.js'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		instrument: ObserveInstrument
	})

	const config = app.get(ConfigService)

	createGrpcServer(app, config)

	app.startAllMicroservices()
	app.init()
}
await bootstrap()
