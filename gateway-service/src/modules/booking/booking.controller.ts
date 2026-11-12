import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'

import { ApiBearerAuth } from '@nestjs/swagger'

import { Protected } from '../../shared/decorators/protected.decorators.js'
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js'
import { BookingClientGrpc } from './booking.grpc.js'

@Controller('booking')
export class BookingController {
	public constructor(private readonly booking: BookingClientGrpc) {}

	@ApiBearerAuth()
	@Protected()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getBookings(@CurrentUser('id') userId: string) {
		const response = await this.booking.call('getUserBookings', {
			userId
		})

		return Array.isArray(response.bookings) ? response.bookings : []
	}
}
