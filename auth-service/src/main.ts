import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'

import { AppModule } from './app.module.js'
import { createGrpcServer } from './infrastructure/grpc/grpc.server.js'
import './observability/tracing.js'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	// //Подключаем Pino как основной логгер
	// app.useLogger(app.get(Logger))

	createGrpcServer(app, config)

	await app.startAllMicroservices()
	await app.listen(9101)
}
await bootstrap()
