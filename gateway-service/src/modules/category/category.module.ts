import { Module } from '@nestjs/common'

import { GrpcModule } from '@faramircinema/common'
import { CategoryClientGrpc } from './category.grpc.js'
import { CategoryController } from './category.controller.js'

@Module({
	imports: [GrpcModule.register(['CATEGORY_PACKAGE'])],
	controllers: [CategoryController],
	providers: [CategoryClientGrpc],
	exports: [CategoryClientGrpc]
})
export class CategoryModule {}
