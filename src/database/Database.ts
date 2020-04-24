import { NexusEnumTypeDef } from '@nexus/schema/dist/core';
import {
    Options,
    Sequelize,
    STRING,
    ModelAttributeColumnOptions,
    INTEGER,
    FLOAT,
    BIGINT,
    BOOLEAN,
    DATE,
    JSON,
    ModelCtor,
} from 'sequelize';
import { Schema, TypeDefinition } from '../schema';
import { Model } from './Model';

export type DatabaseConfig = Options;

export class Database {
    private readonly connection: Sequelize;
    public readonly models = new Map<string, Model>();

    constructor(protected config: DatabaseConfig, modelTypeDefs: TypeDefinition[]) {
        this.connection = new Sequelize(this.config);
        modelTypeDefs.forEach((typeDefinition: TypeDefinition) => {
            this.models.set(typeDefinition.name, new Model(this.connection, typeDefinition));
        });
        this.models.forEach((model) => model.schema.associate(this.connection.models));
    }

    public async start() {
        await this.connection.sync();
    }
}
