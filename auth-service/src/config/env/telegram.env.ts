import { registerAs } from '@nestjs/config'

import { validateEnv } from '../../shared/utils/index.js'
import type { TelegramConfig } from '../interfaces/telegram.interface.js'
import { TelegramValidator } from '../validators/telegram.validator.js'

export const telegramEnv = registerAs<TelegramConfig>('telegram', () => {
	validateEnv(process.env, TelegramValidator)

	return {
		botId: process.env.TG_BOT_ID,
		botToken: process.env.TG_BOT_TOKEN,
		botUsername: process.env.TG_BOT_USERNAME,
		redirectOrigin: process.env.TG_REDIRECT_ORIGIN
	}
})
