import { BookingServiceClient } from '@faramircinema/contracts/gen/ts/booking'
import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'


@Injectable()
export class BookingClientGrpc extends AbstractGrpcClient<BookingServiceClient> {
	constructor(@injectGrpcClient('BOOKING_PACKAGE') client: ClientGrpc) {
		super(client, 'BookingService')
	}
}
