import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	type NestInterceptor
} from '@nestjs/common'
import { RmqContext } from '@nestjs/microservices'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Counter, Histogram } from 'prom-client'
import { catchError, finalize, type Observable, tap, throwError } from 'rxjs'

import { RmqService } from '../../infrastructure/rmq/rmq.service.js'

@Injectable()
export class RmqMetricsInterceptor implements NestInterceptor {
	private readonly SERVICE_NAME = 'notification-service'
	private readonly logger = new Logger(RmqMetricsInterceptor.name)

	public constructor(
		private readonly rmqService: RmqService,
		@InjectMetric('rmq_event_processing_duration_seconds')
		private readonly processingDuration: Histogram<string>,
		@InjectMetric('rmq_event_total')
		private readonly eventsTotal: Counter<string>
	) {}

	public intercept(
		context: ExecutionContext,
		next: CallHandler<any>
	): Observable<any> {
		const rmqContext = context.switchToRpc().getContext<RmqContext>()

		// Получаем имя события из метаданных декоратора @EventPattern
		const pattern = rmqContext.getPattern()
		const event = Array.isArray(pattern) ? pattern[0] : pattern

		const endTimer = this.processingDuration.startTimer({
			service: this.SERVICE_NAME,
			event
		})

		return next.handle().pipe(
			// Срабатывает только при успехе
			tap(() => {
				this.eventsTotal.inc({
					service: this.SERVICE_NAME,
					event,
					status: 'success'
				})
				this.rmqService.ack(rmqContext, event)
			}),
			// Срабатывает только при ошибке
			catchError(error => {
				this.eventsTotal.inc({
					service: this.SERVICE_NAME,
					event,
					status: 'error'
				})

				this.logger.error(
					`Event processing error (${event}): `,
					error instanceof Error ? error.message : error
				)

				this.rmqService.nack(rmqContext, event)

				// Пробрасываем ошибку дальше, чтобы NestJS её залогировал
				return throwError(() => error)
			}),
			finalize(() => {
				endTimer()
			})
		)
	}
}
