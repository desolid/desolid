import { FieldDefinition } from '../../schema';
import { Model } from '../../database';
import { Input } from '.';
import { Association } from 'sequelize';

export abstract class ModelMutationInput extends Input {
    constructor(protected readonly model: Model, name: string) {
        super(model.typeDefinition, name);
    }

    public get fields() {
        // remove readonly fields
        return this.typeDfinition.fields.filter((field) => !field.readonly);
    }

    protected getFieldName(field: FieldDefinition) {
        const assosiation = this.model.datasource.associations[field.name];
        return assosiation ? this.getFieldNameFromAssosiation(assosiation) : field.name;
    }

    protected getFieldNameFromAssosiation(assosiation: Association<any, any>) {
        return assosiation.isSingleAssociation && assosiation.target.name != 'File'
            ? assosiation.foreignKey
            : assosiation.as;
    }
}
