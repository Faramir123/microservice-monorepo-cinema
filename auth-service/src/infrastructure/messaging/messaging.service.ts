import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent
} from '@faramircinema/contracts'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'
import { defaultIfEmpty, lastValueFrom, timeout } from 'rxjs'

@Injectable()
export class MessagingService {
	private readonly logger = new Logger(MessagingService.name)

	/**
	 * Сколько ждём publisher confirm от брокера.
	 * Если брокер не подтверждает за это время — падаем наверх.
	 */
	private static readonly PUBLISH_TIMEOUT_MS = 5_000

	public constructor(
		@Inject('NOTIFICATIONS_CLIENT') private readonly client: ClientProxy
	) {}

	public async otpRequested(data: OtpRequestedEvent): Promise<void> {
		await this.publish('auth.otp.requested', data)
	}

	public async phoneChanged(data: PhoneChangedEvent): Promise<void> {
		await this.publish('account.phone.changed', data)
	}

	public async emailChanged(data: EmailChangedEvent): Promise<void> {
		await this.publish('account.email.changed', data)
	}

	/**
	 * Надёжная публикация: подписка на Observable от `emit()`
	 * запускает publish, `lastValueFrom` ждёт publisher confirm,
	 * `timeout` защищает от зависшего соединения.
	 */
	private async publish(pattern: string, data: unknown): Promise<void> {
		try {
			await lastValueFrom(
				this.client.emit(pattern, data).pipe(
					timeout(MessagingService.PUBLISH_TIMEOUT_MS),
					// emit() для RMQ может завершиться без emission
					// (fire-and-forget) — не бросаем EmptyError.
					defaultIfEmpty(void 0)
				)
			)
		} catch (error) {
			this.logger.error(
				{
					pattern,
					error: error instanceof Error ? error.message : error
				},
				'Failed to publish message to broker'
			)
			throw error
		}
	}
}
