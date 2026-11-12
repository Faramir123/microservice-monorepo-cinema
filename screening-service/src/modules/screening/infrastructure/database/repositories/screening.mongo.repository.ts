import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import type { ScreeningEntity } from '../../../domain/entities/screening.entity'
import { ScreeningRepositoryPort } from '../../../domain/ports/screening.repository.port'
import { ScreeningMapper } from '../../mappers/screening.mapper'
import { ScreeningDocument, ScreeningModel } from '../schemas/screening.schema'

@Injectable()
export class ScreeningMongoRepository implements ScreeningRepositoryPort {
	public constructor(
		@InjectModel(ScreeningModel.name)
		private readonly screening: Model<ScreeningDocument>
	) {}

	public async findOverlap(
		hallId: string,
		startAt: Date,
		endAt: Date
	): Promise<ScreeningEntity | null> {
		const doc = await this.screening
			.findOne({
				hallId,
				startAt: { $lt: endAt },
				endAt: { $gt: startAt }
			})
			.lean()
			.exec()

		return doc ? ScreeningMapper.toEntity(doc) : null
	}

	public async create(entity: ScreeningEntity): Promise<ScreeningEntity> {
		const persistence = ScreeningMapper.toPersistence(entity)

		const doc = new this.screening(persistence)
		await doc.save()

		return ScreeningMapper.toEntity(doc.toObject())
	}

	public async findById(id: string): Promise<ScreeningEntity | null> {
		const doc = await this.screening.findById(id).lean().exec()
		return doc ? ScreeningMapper.toEntity(doc) : null
	}

	public async findByDayRange(
		dayStart: Date,
		dayEnd: Date,
		hallIds?: string[]
	): Promise<ScreeningEntity[]> {
		const query: any = {
			startAt: { $gte: dayStart },
			endAt: { $lte: dayEnd }
		}
		if (hallIds?.length) query.hallId = { $in: hallIds }

		const docs = await this.screening
			.find(query)
			.sort({ startAt: 1 })
			.lean()
			.exec()

		return docs.map(ScreeningMapper.toEntity)
	}

	public async findManyByMovie(
		movieId: string,
		dayStart?: Date,
		dayEnd?: Date
	): Promise<ScreeningEntity[]> {
		const query: any = { movieId }

		if (dayStart) query.startAt = { $gte: dayStart }

		if (dayEnd) query.endAt = { $lte: dayEnd }

		const docs = await this.screening
			.find(query)
			.sort({ startAt: 1 })
			.lean()
			.exec()

		return docs.map(ScreeningMapper.toEntity)
	}
}
