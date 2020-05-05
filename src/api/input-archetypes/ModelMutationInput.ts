import { FieldDefinition } from 'src/schema';
import { Model } from 'src/database';
import { Input } from '.';
import { Association } from 'sequelize';

export abstract class ModelMutationInput extends Input {
    constructor(protected readonly model: Model, name: string) {
        super(model.typeDefinition, name);
    }

    public get fields() {
        // remove auto fill fields
        return this.typeDfinition.fields.filter(
            (field) => field.type != 'ID' && field.name != 'createdAt' && field.name != 'updatedAt',
        );
    }

    protected getFieldName(field: FieldDefinition) {
        const assosiation = this.model.datasource.associations[field.name];
        return assosiation ? this.getFieldNameFromAssosiation(assosiation) : field.name;
    }

    protected getFieldNameFromAssosiation(assosiation: Association<any, any>) {
        return assosiation.isSingleAssociation && assosiation.target.name != 'File' ? assosiation.foreignKey : assosiation.as;
    }
}
