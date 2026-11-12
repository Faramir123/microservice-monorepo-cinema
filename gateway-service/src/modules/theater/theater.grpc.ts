import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'
import type { TheaterServiceClient } from '@faramircinema/contracts/gen/ts/theater'

@Injectable()
export class TheaterClientGrpc extends AbstractGrpcClient<TheaterServiceClient> {
	constructor(@injectGrpcClient('THEATER_PACKAGE') client: ClientGrpc) {
		super(client, 'TheaterService')
		console.log('TheaterGrpcController initialized')
	}
}
