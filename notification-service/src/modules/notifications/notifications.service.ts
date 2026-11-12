import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent
} from '@faramircinema/contracts/dist/src/index.js'
import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

import { MailService } from '../../infrastructure/mail/mail.service.js'
import { SmsService } from '../../infrastructure/sms/sms.service.js'

@Injectable()
export class NotificationsService {
	public constructor(
		private readonly logger: PinoLogger,
		private readonly mailService: MailService,
		private readonly smsService: SmsService
	) {}

	public async sendOtp(data: OtpRequestedEvent) {
		const { code, identifier, type } = data
		this.logger.info(
			`Sending OTP code to identifier=${identifier}, type=${type}`
		)
		if (type === 'email') {
			await this.mailService.sendOtp(identifier, code)
		} else {
			await this.smsService.sendOtp(identifier, code)
		}
	}

	public async sendPhoneChanged(data: PhoneChangedEvent) {
		const { phone, code } = data
		return await this.smsService.sendPhoneChanged(phone, code)
	}

	public async sendEmailChanged(data: EmailChangedEvent) {
		const { email, code } = data
		return await this.mailService.sendEmailChanged(email, code)
	}
}
