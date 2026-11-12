import { Module } from '@nestjs/common'

import { GrpcModule } from '@faramircinema/common'

import { RefoundClientGrpc } from './refound.grpc.js'
import { RefoundController } from './refound.controller.js'

@Module({
	imports: [GrpcModule.register(['REFOUND_PACKAGE'])],
	controllers: [RefoundController],
	providers: [RefoundClientGrpc],
	exports: [RefoundClientGrpc]
})
export class RefoundModule {}
