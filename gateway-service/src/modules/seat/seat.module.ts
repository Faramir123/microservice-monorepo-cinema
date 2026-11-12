import { Module } from '@nestjs/common'

import { GrpcModule } from '@faramircinema/common'
import { SeatClientGrpc } from './seat.grpc.js'
import { SeatController } from './seat.controller.js'

@Module({
	imports: [GrpcModule.register(['SEAT_PACKAGE'])],
	controllers: [SeatController],
	providers: [SeatClientGrpc]
})
export class SeatModule {}
