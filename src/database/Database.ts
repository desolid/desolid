import { NexusEnumTypeDef } from 'nexus/dist/core';
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
import { Schema, DesolidObjectTypeDef } from '../schema';
import { ModelDefinition } from './ModelDefinition';

export type DatabaseConfig = Options;

export class Database {
    private readonly connection: Sequelize;
    private modelDefinitions: ModelDefinition[] = [];
    constructor(protected config: DatabaseConfig, modelTypeDefs: DesolidObjectTypeDef[]) {
        this.connection = new Sequelize(this.config);
        modelTypeDefs.forEach((typeDef: DesolidObjectTypeDef) => {
            const definition = new ModelDefinition(typeDef);
            typeDef.datasource = this.connection.define(definition.name, definition.attributes, definition.options) as ModelCtor<any>;
            this.modelDefinitions.push(definition);
        });
        this.modelDefinitions.forEach((definition) => {
            definition.associate(this.connection.models);
        });
    }

    public get models() {
        return this.connection.models;
    }

    public async start() {
        await this.connection.sync();

    }
}
