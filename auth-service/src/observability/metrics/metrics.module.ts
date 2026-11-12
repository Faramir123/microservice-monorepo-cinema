import { Global, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import {
	makeCounterProvider,
	makeHistogramProvider,
	PrometheusModule
} from '@willsoto/nestjs-prometheus'

import { GrpcMetricsInterceptor } from './grpc-metrics.interceptor.js'

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
			name: 'grpc_request_duration_seconds',
			help: 'gRPC request latency',
			labelNames: ['service', 'method', 'status']
		}),
		makeCounterProvider({
			name: 'grpc_requests_total',
			help: 'total gRPC requests',
			labelNames: ['service', 'method', 'status']
		}),
		GrpcMetricsInterceptor,
		{ provide: APP_INTERCEPTOR, useClass: GrpcMetricsInterceptor }
	]
})
export class MetricsModule {}
