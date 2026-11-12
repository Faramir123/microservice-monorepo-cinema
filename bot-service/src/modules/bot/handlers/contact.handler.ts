import type {
	TelegramCompleteRequest,
	TelegramCompleteResponse
} from '@faramircinema/contracts/gen/ts/auth'
import type { Telegraf } from 'telegraf'

import { authClient } from '@/infrastructure/grpc/auth.client'
import type { TelegrafContext } from '@/shared/interfaces'
import { cellUnary } from '@/shared/utils'

export function registerContactHandler(bot: Telegraf<TelegrafContext>) {
	bot.on('contact', async ctx => {
		const phone = ctx.message.contact.phone_number

		if (!ctx.chat.id && !ctx.session.id)
			return ctx.reply(
				'Произошла ошибка. Пожалуйста, начните процесс через сайт'
			)

		const request: TelegramCompleteRequest = {
			sessionId: `${ctx.session.id}`,
			phone
		}

		const { sessionId } = await cellUnary<TelegramCompleteResponse>(
			authClient.telegramComplete.bind(authClient),
			request
		)

		await ctx.reply('Регистрация успешно завершена', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Вернуться на сайт',
							url: `https://faramiccinema.ru/auth/tg-finalize?sessioId=${sessionId}`
						}
					]
				],
				remove_keyboard: true
			}
		})
	})
}
