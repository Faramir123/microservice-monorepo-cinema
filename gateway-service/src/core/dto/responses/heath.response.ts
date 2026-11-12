import { ApiProperty } from '@nestjs/swagger'

export class HeathResponse {
	@ApiProperty({ example: 'ok' })
	public status: string
	@ApiProperty({ example: '2026-10-18T04:37:57.616Z' })
	public timestamp: string
}
