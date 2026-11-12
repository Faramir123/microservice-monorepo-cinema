import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'
import type { ScreeningServiceClient } from '@faramircinema/contracts/gen/ts/screening'

@Injectable()
export class ScreeningClientGrpc extends AbstractGrpcClient<ScreeningServiceClient> {
	constructor(@injectGrpcClient('SCREENING_PACKAGE') client: ClientGrpc) {
		super(client, 'ScreeningService')
		console.log('ScreeningGrpcController initialized')
	}
}
