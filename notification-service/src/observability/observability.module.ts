import { Module } from '@nestjs/common'
import { MetricsModule } from './metrics/metrics.module.js'

@Module({
	imports: [MetricsModule]
})
export class ObservAbilityModule {}
