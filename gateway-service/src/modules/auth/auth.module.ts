import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller.js'

import { AuthClientGrpc } from './auth.grpc.js'
import { GrpcModule } from '@faramircinema/common/dist/index.js'

@Module({
	imports: [GrpcModule.register(['AUTH_PACKAGE'])],
	controllers: [AuthController],
	providers: [AuthClientGrpc]
})
export class AuthModule {}
