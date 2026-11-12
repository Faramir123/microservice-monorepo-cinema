import { Module } from '@nestjs/common'

import { MovieCacheService } from './movie.cache.service.js'
import { MovieRepository } from './movie.repository.js'
import { MoviesController } from './movies.controller.js'
import { MoviesService } from './movies.service.js'

@Module({
	controllers: [MoviesController],
	providers: [MoviesService, MovieRepository, MovieCacheService]
})
export class MoviesModule {}
