import {
	type EmailChangedEvent,
	type OtpRequestedEvent,
	type PhoneChangedEvent
} from '@faramircinema/contracts/dist/src/index.js'
import { Controller, Logger, UseInterceptors } from '@nestjs/common'
import { Ctx, EventPattern, Payload } from '@nestjs/microservices'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import type { Histogram } from 'prom-client'

import { RmqService } from '../../infrastructure/rmq/rmq.service.js'
import { RmqMetricsInterceptor } from '../../observability/metrics/rmq-metrics.interceptor.js'

import { NotificationsService } from './notifications.service.js'

@Controller()
@UseInterceptors(RmqMetricsInterceptor) // Вешаем интерцептор на весь контроллер
export class NotificationsController {
	private readonly SERVICE_NAME: string
	private readonly logger = new Logger(NotificationsController.name)

	public constructor(
		private readonly rmqService: RmqService,
		private readonly notificationsService: NotificationsService
	) {}

	@EventPattern('auth.otp.requested')
	public async otpRequested(@Payload() data: OtpRequestedEvent) {
		await this.notificationsService.sendOtp(data)
	}

	@EventPattern('account.email.changed')
	public async emailChanged(@Payload() data: EmailChangedEvent) {
		await this.notificationsService.sendEmailChanged(data)
	}

	@EventPattern('account.phone.changed')
	public async phoneChanged(@Payload() data: PhoneChangedEvent) {
		await this.notificationsService.sendPhoneChanged(data)
	}
}
