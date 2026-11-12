import { Module } from '@nestjs/common'
import { TheaterClientGrpc } from './theater.grpc.js'

import { TheaterController } from './theater.controller.js'
import { GrpcModule } from '@faramircinema/common'
import { AccountModule } from '../account/account.module.js'

@Module({
	imports: [GrpcModule.register(['THEATER_PACKAGE']), AccountModule],
	controllers: [TheaterController],
	providers: [TheaterClientGrpc]
})
export class TheaterModule {}
