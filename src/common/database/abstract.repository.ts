import type { AbstractEntity } from './abstract.entity';
import { NotFoundException, type Logger } from '@nestjs/common';
import { Types, type Model, FilterQuery, UpdateQuery } from 'mongoose';

export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (await createdDocument.save()).toJSON() as unknown as T;
  }

  async fineOne(filterQuery: FilterQuery<T>): Promise<T> {
    // lean() returns a document without metadata, just what we have in DB
    const document = await this.model.findOne(filterQuery).lean<T>();

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async fineOneAndUpdate(
    filterQuery: FilterQuery<T>,
    update: UpdateQuery<T>,
  ) {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<T>();

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async find(filterQuery: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filterQuery).lean<T[]>();
  }

  async fineOneAndDelete(
    filterQuery: FilterQuery<T>,
  ): Promise<T> {
    return this.model.findOneAndDelete(filterQuery).lean<T>();
  }
}
