import type { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export function getMailerConfig(configService: ConfigService): MailerOptions {
	return {
		transport: {
			host: configService.get('smtp.host'),
			port: configService.get('smtp.port'),
			auth: {
				user: configService.get('smtp.username'),
				pass: configService.get('smtp.password')
			},
			logger: true, // 👈 включите для подробного лога SMTP-диалога
			debug: true, // 👈 покажет все команды и ответы сервера
			secure: configService.get('smtp.secure')
		},
		defaults: {
			from: `FaramirCinema ${configService.get('smtp.fromAddress')}`
		}
	}
}
