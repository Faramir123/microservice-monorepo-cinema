import type { CorsOptions } from '@nestjs/common/internal'
import { ConfigService } from '@nestjs/config'

export function getCorsConfig(ConfigService: ConfigService): CorsOptions {
	return {
		origin: ConfigService.getOrThrow<string>('HTTP_CORS').split(','),
		credentials: true
	}
}
