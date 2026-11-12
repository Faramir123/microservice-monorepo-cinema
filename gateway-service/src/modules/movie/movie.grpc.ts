import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/abstract-grpc.client.js'
import { injectGrpcClient } from '@faramircinema/common'
import type { MovieServiceClient } from '@faramircinema/contracts/gen/ts/movie'

@Injectable()
export class MovieClientGrpc extends AbstractGrpcClient<MovieServiceClient> {
	constructor(@injectGrpcClient('MOVIE_PACKAGE') client: ClientGrpc) {
		super(client, 'MovieService')
	}
}
