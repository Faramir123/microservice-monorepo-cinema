import type {
	CreateMovieRequest,
	CreateMovieResponse,
	DeleteMovieRequest,
	DeleteMovieResponse,
	GetMovieRequest,
	GetMovieResponse,
	ListMovieRequest,
	ListMovieResponse,
	UpdateMovieRequest,
	UpdateMovieResponse
} from '@faramircinema/contracts/gen/ts/movie'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { MoviesService } from './movies.service.js'

@Controller('movies')
export class MoviesController {
	public constructor(private readonly moviesService: MoviesService) {}

	@GrpcMethod('MovieService', 'ListMovie')
	public async list(data: ListMovieRequest): Promise<ListMovieResponse> {
		return await this.moviesService.getAll(data)
	}

	@GrpcMethod('MovieService', 'GetMovie')
	public async get(data: GetMovieRequest): Promise<GetMovieResponse> {
		console.log('GetMovie request data:', data)
		return await this.moviesService.getOne(data)
	}

	@GrpcMethod('MovieService', 'CreateMovie')
	public async create(
		data: CreateMovieRequest
	): Promise<CreateMovieResponse> {
		return await this.moviesService.create(data)
	}

	@GrpcMethod('MovieService', 'UpdateMovie')
	public async update(
		data: UpdateMovieRequest
	): Promise<UpdateMovieResponse> {
		return await this.moviesService.update(data)
	}

	@GrpcMethod('MovieService', 'DeleteMovie')
	public async delete(
		data: DeleteMovieRequest
	): Promise<DeleteMovieResponse> {
		return await this.moviesService.delete(data)
	}
}
