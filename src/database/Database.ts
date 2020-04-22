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
    private modelDefinitions: Model[] = [];
    constructor(protected config: DatabaseConfig, modelTypeDefs: TypeDefinition[]) {
        this.connection = new Sequelize(this.config);
        modelTypeDefs.forEach((typeDef: TypeDefinition) => {
            const definition = new Model(typeDef);
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
