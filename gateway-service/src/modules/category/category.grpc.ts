import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'
import type { CategoryServiceClient } from '@faramircinema/contracts/gen/ts/category'

@Injectable()
export class CategoryClientGrpc extends AbstractGrpcClient<CategoryServiceClient> {
	constructor(@injectGrpcClient('CATEGORY_PACKAGE') client: ClientGrpc) {
		super(client, 'CategoryService')
	}
}
