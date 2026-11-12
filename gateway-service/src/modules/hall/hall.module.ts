import { Module } from '@nestjs/common'

import { GrpcModule } from '@faramircinema/common'
import { AccountModule } from '../account/account.module.js'
import { HallClientGrpc } from './hall.grpc.js'
import { HallController } from './hall.controller.js'

@Module({
	imports: [GrpcModule.register(['HALL_PACKAGE']), AccountModule],
	controllers: [HallController],
	providers: [HallClientGrpc]
})
export class HallModule {}
