import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'

import type { RefoundServiceClient } from '@faramircinema/contracts/gen/ts/refound'

@Injectable()
export class RefoundClientGrpc extends AbstractGrpcClient<RefoundServiceClient> {
	constructor(@injectGrpcClient('REFOUND_PACKAGE') client: ClientGrpc) {
		super(client, 'RefoundService')
	}
}
