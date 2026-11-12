import {
	IsEnum,
	IsNotEmpty,
	IsNumberString,
	IsString,
	Length,
	Validate
} from 'class-validator'
import { IdentifierValidator } from '../../../../shared/validators/index.js'
import { ApiProperty } from '@nestjs/swagger'

export class VerifyOtpRequest {
	@ApiProperty({
		example: '+79112354698'
	})
	@IsString()
	@Validate(IdentifierValidator)
	public identifier: string

	@ApiProperty({
		example: '123456'
	})
	@IsNotEmpty()
	@IsNumberString()
	@Length(6, 6, { message: 'code must be 6 characters long' })
	public code: string

	@ApiProperty({
		example: 'phone',
		enum: ['phone', 'email']
	})
	@IsEnum(['phone', 'email'])
	public type: 'phone' | 'email'
}
