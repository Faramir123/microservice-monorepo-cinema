import { Module } from '@nestjs/common'
import { MovieClientGrpc } from './movie.grpc.js'

import { MovieController } from './movie.controller.js'
import { GrpcModule } from '@faramircinema/common'

@Module({
	imports: [GrpcModule.register(['MOVIE_PACKAGE'])],
	controllers: [MovieController],
	providers: [MovieClientGrpc],
	exports: [MovieClientGrpc]
})
export class MovieModule {}
