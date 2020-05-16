import { Options, Sequelize } from 'sequelize';
import * as _ from 'lodash';
import { TypeDefinition } from '../schema';
import { Model } from './Model';
import { MapX } from '../utils';
import { Storage } from '../storage';

export type DatabaseConfig = Options;

export class Database {
    private readonly defaultConfig: DatabaseConfig = {
        dialect: 'sqlite',
        storage: 'databse.sqlite',
        logging: false,
    };
    private readonly connection: Sequelize;
    private readonly config: DatabaseConfig
    public readonly models = new MapX<string, Model>();

    constructor(config: DatabaseConfig, modelTypeDefs: MapX<string, TypeDefinition>, storage: Storage) {
        this.config = _.merge({}, this.defaultConfig, config);
        this.connection = new Sequelize(this.config);
        modelTypeDefs.forEach((typeDefinition: TypeDefinition) => {
            this.models.set(typeDefinition.name, new Model(this.connection, typeDefinition, storage));
        });
        this.models.forEach((model) => model.schema.associate(this.models));
    }

    public async start() {
        await this.connection.sync({ force: false });
    }
}
