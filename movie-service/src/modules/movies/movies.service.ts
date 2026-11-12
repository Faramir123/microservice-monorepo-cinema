import { RpcStatus } from '@faramircinema/common'
import type {
	CreateMovieRequest,
	DeleteMovieRequest,
	GetMovieRequest,
	ListMovieRequest,
	ListMovieResponse,
	UpdateMovieRequest
} from '@faramircinema/contracts/gen/ts/movie'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { movies } from '../../infrastructure/database/schema/movies.schema.js'

import { MoviECacheKeys } from './movie.cache.keys.js'
import { MovieCacheService } from './movie.cache.service.js'
import { MovieMapper } from './movie.mapper.js'
import { MovieRepository } from './movie.repository.js'

@Injectable()
export class MoviesService {
	public constructor(
		private readonly movieRepository: MovieRepository,
		private readonly movieCachService: MovieCacheService
	) {}

	public async getAll(data: ListMovieRequest) {
		const filter = {
			category: data.category || undefined, // Безопаснее, чем ?? если придет пустая строка
			random: data.random === true,
			limit: data.limit > 0 ? data.limit : undefined
		}

		const cached =
			await this.movieCachService.getAll<ListMovieResponse['movie']>(
				filter
			)

		if (cached) return { movie: cached }

		const movies = await this.movieRepository.findAll(filter)
		const result = movies.map(movie => MovieMapper.toMovie(movie))

		await this.movieCachService.setAll(filter, result)

		return {
			movie: result
		}
	}

	public async getOne(data: GetMovieRequest) {
		const cacheKey = data.id
			? MoviECacheKeys.byId(data.id)
			: MoviECacheKeys.bySlug(data.slug)

		const cached =
			await this.movieCachService.get<typeof movies.$inferSelect>(
				cacheKey
			)

		if (cached) return { movie: cached }

		if (!data.id && !data.slug) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Either id or slug must be provided'
			})
		}

		const movie = data.id
			? await this.movieRepository.findById(data.id)
			: await this.movieRepository.findBySlug(data.slug as string)

		if (!movie) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Movie not found'
			})
		}

		const mapped = MovieMapper.toMovie(movie)
		await this.movieCachService.set(cacheKey, mapped)

		return { movie: mapped }
	}

	public async delete(data: DeleteMovieRequest) {
		return await this.movieRepository.delete(data)
	}

	public async create(data: CreateMovieRequest) {
		const createdMovie = await this.movieRepository.create(data)

		if (!createdMovie) {
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: 'Failed to create movie'
			})
		}

		// Возвращаем в обертке, как требует CreateMovieResponse
		return { movie: MovieMapper.toMovie(createdMovie) }
	}

	public async update(data: UpdateMovieRequest) {
		// 1. Проверяем, что пришел объект фильма и в нем есть ID
		if (!data.movie || !data.movie.id) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Movie ID is required for update'
			})
		}

		// 2. Вызываем метод репозитория (мы его написали ранее)
		const updatedMovie = await this.movieRepository.update(data)

		// 3. Если репозиторий вернул null, значит фильма с таким ID нет в базе
		if (!updatedMovie) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Movie to update not found'
			})
		}

		// 4. Возвращаем в формате, который требует UpdateMovieResponse
		return { movie: MovieMapper.toMovie(updatedMovie) }
	}
}
