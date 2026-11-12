import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { getExolveConfig } from '../../config/factories/exolve.config.js'
import { MailModule } from '../../infrastructure/mail/mail.module.js'
import { SmsModule } from '../../infrastructure/sms/sms.module.js'
import { RmqMetricsInterceptor } from '../../observability/metrics/rmq-metrics.interceptor.js'

import { NotificationsController } from './notifications.controller.js'
import { NotificationsService } from './notifications.service.js'

@Module({
	imports: [
		MailModule,
		SmsModule.registerAsync({
			useFactory: getExolveConfig,
			inject: [ConfigService]
		})
	],
	controllers: [NotificationsController],
	providers: [NotificationsService, RmqMetricsInterceptor]
})
export class NotificationsModule {}
