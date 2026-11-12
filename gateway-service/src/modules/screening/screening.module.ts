import { Module } from '@nestjs/common'

import { GrpcModule } from '@faramircinema/common'
import { AccountModule } from '../account/account.module.js'
import { ScreeningController } from './screening.controller.js'
import { ScreeningClientGrpc } from './screening.grpc.js'

@Module({
	imports: [GrpcModule.register(['SCREENING_PACKAGE']), AccountModule],
	controllers: [ScreeningController],
	providers: [ScreeningClientGrpc]
})
export class ScreeningModule {}
