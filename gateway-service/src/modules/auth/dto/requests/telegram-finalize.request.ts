import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class TelegramFinalizeRequest {
	@ApiProperty({
		example: 'eyJpZCI6NjA3NDk0MDAyLCJmaXJzdF9uYW1lIjoi'
	})
	@IsString()
	@IsNotEmpty()
	public sessionId: string
}
