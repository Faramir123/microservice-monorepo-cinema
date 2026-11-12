import { PROTO_PATHS } from '@faramircinema/contracts/dist/src/index.js'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccountClientGrpc } from '../../infrastructure/grpc/clients/account.client.js'

import { UserEntity } from './entities/user.entity.js'
import { UsersController } from './users.controller.js'
import { UsersRepository } from './users.repository.js'
import { UsersService } from './users.service.js'

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]),
		ClientsModule.registerAsync([
			{
				name: 'ACCOUNT_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'account.v1',
						protoPath: PROTO_PATHS.ACCOUNT,
						url: configService.getOrThrow<string>('AUTH_GRPC_URL')
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	controllers: [UsersController],
	providers: [UsersService, UsersRepository, AccountClientGrpc]
})
export class UsersModule {}
