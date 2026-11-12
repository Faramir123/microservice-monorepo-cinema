import { HttpService } from '@nestjs/axios'
import { Inject, Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { firstValueFrom, retry, throwError, timeout, timer } from 'rxjs'

import { SMS_OPTIONS } from './constants/sms.constants.js'
import type {
	SendSmsRequest,
	SendSmsResponse
} from './interfaces/send-sms.interface.js'
import type { SmsOptions } from './interfaces/sms-options.interface.js'

@Injectable()
export class SmsService {
	private readonly logger = new Logger(SmsService.name)
	private readonly BASE_URL = 'https://api.exolve.ru'

	public constructor(
		private readonly httpService: HttpService,
		@Inject(SMS_OPTIONS) private readonly options: SmsOptions
	) {}

	public async sendOtp(phone: string, code: string) {
		return this.send({
			destination: phone,
			text: `Ваш код подтверждения: ${code}`
		})
	}

	public async sendPhoneChanged(phone: string, code: string) {
		return this.send({
			destination: phone,
			text: `Ваш код подтверждения смены номера телефона : ${code}`
		})
	}

	public async send(data: SendSmsRequest): Promise<SendSmsResponse> {
		// ✅ Правильное форматирование номера (убираем всё кроме цифр)
		let cleanPhone = data.destination.replace(/\D/g, '')
		if (cleanPhone.startsWith('8')) {
			cleanPhone = '7' + cleanPhone.slice(1)
		}
		// Если номер не начинается с 7 (например, ввели без кода страны)
		if (!cleanPhone.startsWith('7') && cleanPhone.length === 10) {
			cleanPhone = '7' + cleanPhone
		}

		const payload = {
			number: data.sender ?? this.options.sender,
			destination: cleanPhone, // Отправляем чистый номер
			text: data.text
		}

		return this.request<SendSmsResponse>(
			'POST',
			'/messaging/v1/SendSMS',
			payload
		)
	}

	private async request<T>(
		method: 'GET' | 'POST',
		path: string,
		body?: unknown
	): Promise<T> {
		const url = `${this.BASE_URL}${path}`

		const request$ = this.httpService
			.request<T>({
				method,
				url,
				data: body,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.options.apiKey}`
				}
			})
			.pipe(
				timeout(7000),
				retry({
					count: 2,
					delay: (error, retryCount) => {
						// ✅ НЕ ДЕЛАЕМ РЕТРАЙ, если это 400 (Bad Request)
						if (
							axios.isAxiosError(error) &&
							error.response?.status === 400
						) {
							return throwError(() => error)
						}
						this.logger.warn(
							`Retry request ${method} ${path}: ${retryCount}/2. Error: ${error.message}`
						)
						return timer(500)
					}
				})
			)

		try {
			const response = await firstValueFrom(request$)
			return response.data
		} catch (error) {
			// ✅ Правильная и короткая обработка ошибки
			if (axios.isAxiosError(error)) {
				const exolveError = error.response?.data?.error?.message

				// Пишем только понятное сообщение, без гигантских объектов
				this.logger.error(
					`Exolve API Error (${method} ${path}): ${exolveError || error.message}`
				)
			} else {
				this.logger.error(`Unknown error (${method} ${path}):`, error)
			}

			throw error // Пробрасываем ошибку дальше (в контроллер)
		}
	}
}
