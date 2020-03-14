import { FieldOutConfig } from 'nexus/dist/core';
import { ObjectTypeDefinitionSummary } from '../helpers/TypeDefinitionSummary';
import { Model } from './Model';
import { Entity } from './Entity';

export class Type extends Entity {
    public type = 'type';
    constructor(protected readonly definition: ObjectTypeDefinitionSummary) {
        super(definition.name, {
            name: definition.name,
            description: definition.description,
            definition: (t) => this.fieldsTypeDef.forEach(({ name, config }) => t.field(name, config)),
        });
    }
    private get fieldsTypeDef() {
        return this.definition.fields.map((field) => {
            const type = Type.dictionary.get(field.type) as Model;
            return {
                name: field.name,
                config: {
                    ...field.config,
                    type: type || field.type,
                } as FieldOutConfig<any, any>,
            };
        });
    }
}
