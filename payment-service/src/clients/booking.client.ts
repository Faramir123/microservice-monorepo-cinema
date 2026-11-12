import type {
	BookingServiceClient,
	CancelBookingsRequest,
	ConfirmBookingsRequest,
	CreateReservationRequest
} from '@faramircinema/contracts/gen/ts/booking'
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class BookingClientGrpc implements OnModuleInit {
	private bookingService: BookingServiceClient

	public constructor(
		@Inject('BOOKING_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.bookingService =
			this.client.getService<BookingServiceClient>('BookingService')
	}

	public createReservation(data: CreateReservationRequest) {
		return this.bookingService.createReservation(data)
	}

	public confirmBooking(data: ConfirmBookingsRequest) {
		return this.bookingService.confirmBookings(data)
	}

	public cancelBooking(data: CancelBookingsRequest) {
		return this.bookingService.cancelBookings(data)
	}
}
