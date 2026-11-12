import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { type MicroserviceOptions, Transport } from '@nestjs/microservices'

import { AppModule, ObserveInstrument } from './app.module.js'
import './observability/tracing.js'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		instrument: ObserveInstrument
	})

	const config = app.get(ConfigService)

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [config.get('rmq.url')],
			queue: config.get('rmq.queue'),
			queueOptions: {
				durable: true //презапуск брокера, при его перезапуске очередь будет восстановлена из хранилища
			},
			noAck: false, //включаем ручное подтверждение получения сообщений(отключаем автоматическое)
			prefetchCount: 1, //отдаём по одному сообщщению за раз
			persistent: true // сообщения помечаются как устойчевые, чтобы они не терялись при перезапуске брокера
		}
	})

	await app.startAllMicroservices()
	await app.listen(9102)
}
await bootstrap()
