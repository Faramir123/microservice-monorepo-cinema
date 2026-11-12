import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { RedisService } from '../../infrastructure/redis/redis.service.js'

import type { FiltersParam } from './interfaces/filter-params.interface.js'
import { MoviECacheKeys } from './movie.cache.keys.js'

@Injectable()
export class MovieCacheService {
	private readonly CACHE_TTL: number

	public constructor(
		private readonly configService: ConfigService,
		private readonly redisService: RedisService
	) {
		this.CACHE_TTL = this.configService.get('CACHE_TTL')
	}

	public get<T = unknown>(key: string): Promise<T | null> {
		return this.redisService.getJson<T>(key)
	}

	public set(key: string, value: unknown): Promise<void> {
		return this.redisService.setJson(key, value, this.CACHE_TTL)
	}

	public getAll<T = unknown>(params: FiltersParam): Promise<T | null> {
		return this.get(MoviECacheKeys.all(params))
	}

	public setAll(params: FiltersParam, value: unknown) {
		return this.set(MoviECacheKeys.all(params), value)
	}
}
