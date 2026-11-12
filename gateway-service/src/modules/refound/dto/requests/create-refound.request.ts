import { IsNotEmpty, IsString } from 'class-validator'

export class CreateRefoundRequest {
	@IsString()
	@IsNotEmpty()
	public bookingId: string
}
