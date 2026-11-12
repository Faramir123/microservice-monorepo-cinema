import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { getMailerConfig } from '../../config/factories/mailer.config.js'

import { MailService } from './mail.service.js'
import { TemplateService } from './template.service.js'

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory: getMailerConfig,
			inject: [ConfigService]
		})
	],
	providers: [MailService, TemplateService],
	exports: [MailService]
})
export class MailModule {}
