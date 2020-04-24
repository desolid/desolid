import { Sequelize, ModelCtor } from 'sequelize';
import { ModelSchema } from '.';
import { TypeDefinition } from '../schema';

export class Model {
    public readonly datasource: ModelCtor<any>;
    public readonly schema: ModelSchema;
    constructor(database: Sequelize, public readonly typeDefinition: TypeDefinition) {
        this.schema = new ModelSchema(typeDefinition);
        this.datasource = database.define(
            this.typeDefinition.name,
            this.schema.attributes,
            this.schema.options,
        ) as ModelCtor<any>;
        typeDefinition.model = this;
    }
}
