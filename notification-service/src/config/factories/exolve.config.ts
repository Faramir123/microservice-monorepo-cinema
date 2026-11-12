import type { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

import type { SmsOptions } from '../../infrastructure/sms/interfaces/sms-options.interface.js'

export function getExolveConfig(configService: ConfigService): SmsOptions {
	return {
		apiKey: configService.get('exolve.apiKey') ?? '',
		sender: configService.get('exolve.sender')
	}
}
