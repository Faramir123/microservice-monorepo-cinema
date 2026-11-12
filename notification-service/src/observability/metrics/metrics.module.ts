import { Global, Module } from '@nestjs/common'
import {
	makeCounterProvider,
	makeHistogramProvider,
	PrometheusModule
} from '@willsoto/nestjs-prometheus'

@Global()
@Module({
	imports: [
		PrometheusModule.register({
			path: '/metrics',
			defaultMetrics: {
				enabled: true
			}
		})
	],
	providers: [
		makeHistogramProvider({
			name: 'rmq_event_processing_duration_seconds',
			help: 'RabbitMQ event processing latency',
			labelNames: ['service', 'event'],
			buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5]
		}),
		makeCounterProvider({
			name: 'rmq_event_total',
			help: 'total RMQ events processed',
			labelNames: ['service', 'event', 'status']
		}),
		makeCounterProvider({
			name: 'rmq_events_ack_total',
			help: 'total ACKed RMQ events processed',
			labelNames: ['service', 'event']
		}),
		makeCounterProvider({
			name: 'rmq_events_nack_total',
			help: 'total NACKed RMQ events processed',
			labelNames: ['service', 'event']
		})
	],
	exports: [
		'PROM_METRIC_RMQ_EVENT_PROCESSING_DURATION_SECONDS',
		'PROM_METRIC_RMQ_EVENT_TOTAL',
		'PROM_METRIC_RMQ_EVENTS_ACK_TOTAL',
		'PROM_METRIC_RMQ_EVENTS_NACK_TOTAL'
	]
})
export class MetricsModule {}
