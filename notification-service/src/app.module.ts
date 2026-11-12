import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { createObserveModule } from '@nestjs/observe'
import { LoggerModule } from 'nestjs-pino'

import configuration from './config/configuration.js'
import { MailModule } from './infrastructure/mail/mail.module.js'
import { RmqModule } from './infrastructure/rmq/rmq.module.js'
import { SmsModule } from './infrastructure/sms/sms.module.js'
import { NotificationsModule } from './modules/notifications/notifications.module.js'
import { ObservAbilityModule } from './observability/observability.module.js'

export const { ObserveModule, ObserveInstrument } = createObserveModule()

@Module({
	imports: [
		// Distributed tracing, auto-correlated logs, request/job metrics, error
		// telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
		ObserveModule.forRoot({
			appKey: 'YOUR_APP_KEY',
			appSecret: 'YOUR_APP_SECRET',
			serviceId: 'notification-service'
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				'.env'
			], //  путь к файлу (относительно корня проекта)
			load: [configuration],
			expandVariables: true
		}),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.LOG_LEVEL || 'info',
				transport: {
					target: 'pino/file',
					options: {
						destination:
							'/var/log/services/notification/notification.log',
						mkdir: true
					}
				},
				messageKey: 'msg',
				customProps: () => ({ service: 'notification-service' })
			}
		}),
		RmqModule,
		ObservAbilityModule,
		NotificationsModule,
		MailModule,
		SmsModule
	]
})
export class AppModule {}
