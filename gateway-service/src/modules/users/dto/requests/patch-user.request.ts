import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class PatchUserRequest {
	@ApiPropertyOptional({
		example: 'Evgen Matveev'
	})
	@IsString()
	@IsNotEmpty()
	public name: string
}
