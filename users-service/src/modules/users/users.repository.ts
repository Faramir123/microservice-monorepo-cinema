import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserEntity } from './entities/user.entity.js'

@Injectable()
export class UsersRepository {
	public constructor(
		@InjectRepository(UserEntity)
		private readonly repository: Repository<UserEntity>
	) {}

	public findById(id: string): Promise<UserEntity | null> {
		return this.repository.findOne({ where: { id } })
	}

	/**
	 * Идемпотентный create: `INSERT … ON CONFLICT (id) DO NOTHING`.
	 * Повторный вызов с существующим id не трогает ни одного поля
	 */
	public async create(
		data: Pick<UserEntity, 'id'>
	): Promise<UserEntity | null> {
		await this.repository
			.createQueryBuilder()
			.insert()
			.into(UserEntity)
			.values(data)
			.orIgnore()
			.execute()

		return this.findById(data.id)
	}

	public async update(
		id: string,
		data: Partial<UserEntity>
	): Promise<UserEntity | null> {
		await this.repository.update({ id }, data)

		return this.findById(id)
	}
}
