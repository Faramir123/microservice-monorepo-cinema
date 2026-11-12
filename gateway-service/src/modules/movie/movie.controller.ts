import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query
} from '@nestjs/common'

import { MovieClientGrpc } from './movie.grpc.js'
import { GetMoviesRequest } from './dto/index.js'
import { MovieMapper } from './movie.mapper.js'

@Controller('movie')
export class MovieController {
	public constructor(private readonly movie: MovieClientGrpc) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll(@Query() dto: GetMoviesRequest) {
		const response = await this.movie.call('listMovie', dto)

		return Array.isArray(response.movie)
			? response.movie.map(item => MovieMapper.toMovie(item))
			: []
	}

	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	public async geBySlug(@Param('slug') slug: string) {
		const { movie } = await this.movie.call('getMovie', { slug })

		return MovieMapper.toMovie(movie)
	}
}
