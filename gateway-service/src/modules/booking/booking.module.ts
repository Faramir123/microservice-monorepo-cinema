import { Module } from '@nestjs/common'

import { GrpcModule } from '@faramircinema/common'
import { BookingController } from './booking.controller.js'
import { BookingClientGrpc } from './booking.grpc.js'

@Module({
	imports: [GrpcModule.register(['BOOKING_PACKAGE'])],
	controllers: [BookingController],
	providers: [BookingClientGrpc],
	exports: [BookingClientGrpc]
})
export class BookingModule {}
