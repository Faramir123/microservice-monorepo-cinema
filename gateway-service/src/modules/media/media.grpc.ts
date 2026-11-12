import { injectGrpcClient } from '@faramircinema/common/dist/index.js'
import type { MediaServiceClient } from '@faramircinema/contracts/gen/ts/media'
import { Injectable } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { AbstractGrpcClient } from '../../shared/grpc/index.js'

@Injectable()
export class MediaClientGrpc extends AbstractGrpcClient<MediaServiceClient> {
	constructor(@injectGrpcClient('MEDIA_PACKAGE') client: ClientGrpc) {
		super(client, 'MediaService')
	}
}
