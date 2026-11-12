import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'

import { AppModule, ObserveInstrument } from './core/app.module.js'
import { getCorsConfig } from './core/config/cors.config.js'
import { getValidationPipeConfig } from './core/config/validation.pipe.config.js'
import './observability/tracing.js'
import { GrpcExceptionFilter } from './shared/fiters/grpc-exception.filter.js'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		instrument: ObserveInstrument
	})

	const config = app.get(ConfigService)
	const logger = new Logger()

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()))

	app.useGlobalFilters(new GrpcExceptionFilter())

	app.enableCors(getCorsConfig(config))

	const swaggerConfig = new DocumentBuilder()
		.setTitle('Faramir Cinema API')
		.setDescription('API Getway for FARAMIR Cinema microservices')
		.setVersion('1.0.0')
		.addBearerAuth()
		.build()

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

	SwaggerModule.setup('/docs', app, swaggerDocument, {
		yamlDocumentUrl: '/openapi.yaml'
	})

	const port = config.getOrThrow<string>('HTTP_PORT')
	const host = config.getOrThrow<string>('HTTP_HOST')

	await app.listen(port)

	logger.log(`getaway started: ${host}`)
	logger.log(`Swagger: ${host}/docs`)
}
await bootstrap()
