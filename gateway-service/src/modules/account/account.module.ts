import { Module } from '@nestjs/common'
import { AccountClientGrpc } from './account.grpc.js'

import { AccountController } from './account.controller.js'
import { GrpcModule } from '@faramircinema/common'

@Module({
	imports: [GrpcModule.register(['ACCOUNT_PACKAGE'])],
	controllers: [AccountController],
	providers: [AccountClientGrpc],
	exports: [AccountClientGrpc]
})
export class AccountModule {}
