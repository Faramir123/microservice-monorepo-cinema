import { Module } from '@nestjs/common'
import { UsersController } from './users.controlle.js'
import { UsersClientGrpc } from './users.grpc.js'
import { GrpcModule } from '@faramircinema/common'

import { MediaModule } from '../media/media.module.js'

@Module({
	imports: [GrpcModule.register(['USERS_PACKAGE']), MediaModule],
	controllers: [UsersController],
	providers: [UsersClientGrpc]
})
export class UsersModule {}
