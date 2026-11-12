import { Module } from '@nestjs/common'

import { MediaClientGrpc } from './media.grpc.js'
import { GrpcModule } from '@faramircinema/common/dist/grpc/grpc.module.js'

@Module({
	imports: [GrpcModule.register(['MEDIA_PACKAGE'])],
	providers: [MediaClientGrpc],
	exports: [MediaClientGrpc]
})
export class MediaModule {}
