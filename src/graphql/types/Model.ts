import { GraphQLResolveInfo } from 'graphql';
import { Repository } from 'typeorm';
import { Schema, TypeDefinition } from '..';
import { Type } from '.';

export interface ModelEntry {
    id: string | number;
}

export class Model extends Type {
    public repository: Repository<ModelEntry>;
    constructor(definition: TypeDefinition, schema: Schema) {
        super(definition, schema, 'model');
    }
    public setRepository(repository: Repository<any>) {
        this.repository = repository;
    }

    public async createOne(data: any) {
        return this.repository.save(data) as Promise<ModelEntry>;
    }

    public async createMany(data: any[]) {
        return this.repository.save<ModelEntry>(data);
    }

    /**
     *
     * @returns affected rows (will be `undefined` on SQLite)
     */
    public async update(data, where: any) {
        return this.repository.update(where, data).then((result) => result.affected);
    }

    /**
     *
     * @returns affected rows (will be `undefined` on SQLite)
     */
    public async delete(where: any) {
        return this.repository.delete(where).then((result) => result.affected);
    }

    public async find(
        select: string[],
        where: any,
        order: {
            [x: string]: 'ASC' | 'DESC' | 1 | -1;
        },
        skip: number,
        limit: number,
    ) {
        return this.repository.find({ where, select: select as any, skip, order, take: limit });
    }
    public async findOne(select: string[], where: any) {
        return this.repository.findOne(where, { select: select as any });
    }
}
