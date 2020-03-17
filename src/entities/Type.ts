import { FieldOutConfig } from 'nexus/dist/core';
import Model from './Model';
import Entity from './Entity';
import { ObjectTypeDefinitionSummary } from '../helpers/definition-summary';

export default class Type extends Entity {
    constructor(public readonly definition: ObjectTypeDefinitionSummary, type: 'type' | 'model' = 'type') {
        super(
            definition.name,
            {
                name: definition.name,
                description: definition.description,
                definition: (t) => this.fieldTypeDefs.forEach(({ name, config }) => t.field(name, config)),
            },
            type,
        );
    }
    private get fieldTypeDefs() {
        return this.definition.fields.map((field) => {
            const type = Entity.dictionary.get(field.type) as Model;
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
