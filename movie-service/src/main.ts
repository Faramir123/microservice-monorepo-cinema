import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule, ObserveInstrument } from './core/app.module.js'
import { setupGrpc } from './core/bootstrap/grpc.js'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		instrument: ObserveInstrument
	})

	const config = app.get(ConfigService)

	setupGrpc(app, config)

	app.startAllMicroservices()
	app.init()
}
await bootstrap()
