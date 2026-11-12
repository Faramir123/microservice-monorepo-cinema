import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'

import type { SeatServiceClient } from '@faramircinema/contracts/gen/ts/seat'

@Injectable()
export class SeatClientGrpc extends AbstractGrpcClient<SeatServiceClient> {
	constructor(@injectGrpcClient('SEAT_PACKAGE') client: ClientGrpc) {
		super(client, 'SeatService')
		console.log('SeatGrpcController initialized')
	}
}
