import { IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class CreateScreeningRequest {
	@IsString()
	@IsNotEmpty()
	public movieId: string

	@IsString()
	@IsNotEmpty()
	public hallId: string

	@IsNotEmpty()
	@IsDateString()
	public startAt: string

	@IsNotEmpty()
	@IsDateString()
	public endAt: string
}
