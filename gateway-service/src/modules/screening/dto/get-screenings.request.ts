import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsOptional, IsString } from 'class-validator'

export class GetScreeningsRequest {
	@ApiPropertyOptional({
		description: 'Theater ID to filter screenings',
		example: '811jaaawef8323mfirfis'
	})
	@IsOptional()
	@IsString()
	public theaterId?: string

	@ApiPropertyOptional({
		description: 'Target date (ISO or YYYY-MM-DDD)',
		example: '2026-11-09'
	})
	@IsOptional()
	@IsISO8601()
	public date?: string
}
