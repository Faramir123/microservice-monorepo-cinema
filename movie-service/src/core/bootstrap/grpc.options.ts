import { PROTO_PATHS } from '@faramircinema/contracts'
import type { GrpcOptions } from '@nestjs/microservices'

export const grpcPackages = ['movie.v1', 'category.v1']

export const grpcProtoPaths = [PROTO_PATHS.MOVIE, PROTO_PATHS.CATEGORY]

export const grpcLoader: NonNullable<GrpcOptions['options']['loader']> = {
	keepCase: false,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
}
