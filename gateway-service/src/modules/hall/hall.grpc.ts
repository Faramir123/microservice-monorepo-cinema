import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'
import type { HallServiceClient } from '@faramircinema/contracts/gen/ts/hall'

@Injectable()
export class HallClientGrpc extends AbstractGrpcClient<HallServiceClient> {
	constructor(@injectGrpcClient('HALL_PACKAGE') client: ClientGrpc) {
		super(client, 'HallService')
		console.log('HallGrpcController initialized')
	}
}
