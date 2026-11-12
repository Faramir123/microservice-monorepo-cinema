import type {
	CreateMovieRequest,
	DeleteMovieRequest,
	ListMovieRequest,
	UpdateMovieRequest
} from '@faramircinema/contracts/gen/ts/movie'
import { Inject, Injectable } from '@nestjs/common'
import { and, desc, eq, gt, isNull, lte, or, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE_DB } from '../../infrastructure/database/drizzle/drizzle.provider.js'
import { categories } from '../../infrastructure/database/schema/categories.schema.js'
import { movies } from '../../infrastructure/database/schema/movies.schema.js'

@Injectable()
export class MovieRepository {
	public constructor(
		@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase
	) {}

	public async findAll(filter: ListMovieRequest) {
		const where = this.buildWhere(filter)
		const orderBy = this.buildOrder(filter)

		const query = this.db
			.select({
				id: movies.id,
				title: movies.title,
				slug: movies.slug,
				poster: movies.poster,
				ratingAge: movies.ratingAge,
				releaseDate: movies.releaseDate
			})
			.from(movies)
			.leftJoin(categories, eq(movies.categoryId, categories.id))
			.where(where)
			.orderBy(orderBy)

		if (filter.limit && filter.limit > 0) return query.limit(filter.limit)

		return query
	}

	public async findBySlug(slug: string) {
		return this.db
			.select()
			.from(movies)
			.where(eq(movies.slug, slug))
			.limit(1)
			.then(r => r[0] ?? null)
	}

	public async findById(id: string) {
		return this.db
			.select()
			.from(movies)
			.where(eq(movies.id, id))
			.limit(1)
			.then(r => r[0] ?? null)
	}

	public async create(request: CreateMovieRequest) {
		const createdMovies = await this.db
			.insert(movies)
			.values({
				title: request.title,
				slug: request.slug,
				poster: request.poster,
				description: '',
				duration: 0,

				ratingAge: request.ratingAge ? Number(request.ratingAge) : 0,
				releaseDate: this.parseTimestamp(request.releaseDate)
			})
			.returning()

		return createdMovies[0] ?? null
	}

	public async update(request: UpdateMovieRequest) {
		const movie = request.movie

		if (!movie || !movie.id) {
			throw new Error('Для обновления необходим ID фильма')
		}

		const updatedMovies = await this.db
			.update(movies)
			.set({
				title: movie.title,
				slug: movie.slug,
				description: movie.description,
				// В proto-контракте опечатка 'porter', мапим её в 'poster' базы
				poster: movie.porter,
				banner: movie.banner,
				duration: movie.duration,
				// В proto ratingAge - string, в базе - integer
				ratingAge: movie.ratingAge
					? Number(movie.ratingAge)
					: undefined,
				country: movie.country,
				releaseDate: this.parseTimestamp(movie.releaseDate),
				updatedAt: new Date() // Обновляем дату модификации
			})
			.where(eq(movies.id, movie.id))
			.returning()

		return updatedMovies[0] ?? null
	}

	public async delete(request: DeleteMovieRequest) {
		let condition

		if (request.id) {
			condition = eq(movies.id, request.id)
		} else if (request.slug) {
			condition = eq(movies.slug, request.slug)
		} else {
			throw new Error('Необходимо передать ID или slug для удаления')
		}

		const deletedMovies = await this.db
			.delete(movies)
			.where(condition)
			.returning()

		// Если массив не пустой - значит фильм был найден и удален
		return {
			ok: deletedMovies.length > 0
		}
	}

	/**
	 * Безопасно конвертирует Protobuf Timestamp в нативный JS Date
	 */

	private parseTimestamp(timestamp?: {
		seconds: number | string
		nanos: number | string
	}): Date | undefined {
		if (!timestamp) return undefined

		return new Date(
			Number(timestamp.seconds) * 1000 + Number(timestamp.nanos) / 1000000
		)
	}

	private buildWhere(filter: ListMovieRequest) {
		const now = new Date()
		const conditions = []

		if (!filter.category || filter.category === 'all') {
		} else if (filter.category === 'now') {
			conditions.push(lte(movies.releaseDate, now))
		} else if (filter.category === 'soon') {
			conditions.push(
				or(gt(movies.releaseDate, now), isNull(movies.releaseDate))
			)
		} else {
			conditions.push(eq(categories.slug, filter.category))
		}

		return conditions.length ? and(...conditions) : undefined
	}

	private buildOrder(filter: ListMovieRequest) {
		if (filter.random) return sql`RANDOM()`

		return desc(movies.releaseDate)
	}
}
