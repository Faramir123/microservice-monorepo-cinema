import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { destination } from 'pino'

import {
	databaseEnv,
	grpcEnv,
	passportEnv,
	redisEnv,
	rmqEnv,
	telegramEnv
} from './config/env/index.js'
import { MessagingModule } from './infrastructure/messaging/messaging.module.js'
import { PrismaModule } from './infrastructure/prisma/prisma.module.js'
import { RedisModule } from './infrastructure/redis/redis.module.js'
import { AccountModule } from './modules/account/account.module.js'
import { AuthModule } from './modules/auth/auth.module.js'
import { OtpModule } from './modules/otp/otp.module.js'
import { TelegramModule } from './modules/telegram/telegram.module.js'
import { TokenModule } from './modules/token/token.module.js'
import { UsersModule } from './modules/users/users.module.js'
import { ObservAbilityModule } from './observability/observability.module.js'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // 👈 делает ConfigService доступным везде
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				'.env'
			], //  путь к файлу (относительно корня проекта)
			load: [
				grpcEnv,
				databaseEnv,
				redisEnv,
				telegramEnv,
				passportEnv,
				rmqEnv
			]
		}),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.LOG_LEVEL || 'info',
				transport: {
					target: 'pino/file',
					options: {
						destination: '/var/log/services/auth/auth.log',
						mkdir: true
					}
				},
				messageKey: 'msg',
				customProps: () => ({ service: 'auth-service' })
			}
		}),
		PrismaModule,
		RedisModule,
		MessagingModule,
		ObservAbilityModule,
		AuthModule,
		OtpModule,
		AccountModule,
		TelegramModule,
		TokenModule,
		UsersModule
	]
})
export class AppModule {}
