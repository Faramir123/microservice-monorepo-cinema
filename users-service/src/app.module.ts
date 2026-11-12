import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { createObserveModule } from '@nestjs/observe'

import { DatabaseModule } from './infrastructure/grpc/database/database.module.js'
import { UsersModule } from './modules/users/users.module.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
	imports: [
		// Distributed tracing, auto-correlated logs, request/job metrics, error
		// telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
		ObserveModule.forRoot({
			appKey: 'YOUR_APP_KEY',
			appSecret: 'YOUR_APP_SECRET',
			serviceId: 'users-service'
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env..env.${process.env.NODE_ENV}`,
				'.env'
			] //  путь к файлу (относительно корня проекта)
		}),
		DatabaseModule,
		UsersModule
	]
})
export class AppModule {}
