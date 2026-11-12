import { IsEnum, IsString, Validate } from 'class-validator'
import { IdentifierValidator } from '../../../../shared/validators/index.js'
import { ApiProperty } from '@nestjs/swagger'

export class SendOtpRequest {
	@ApiProperty({
		example: '+79112354698'
	})
	@IsString()
	@Validate(IdentifierValidator)
	public identifier: string

	@ApiProperty({
		example: 'phone',
		enum: ['phone', 'email']
	})
	@IsEnum(['phone', 'email'])
	public type: 'phone' | 'email'
}
