import { NexusObjectTypeDef, ObjectDefinitionBlock } from 'nexus/dist/core';
import Desolid from '../Desolid';
import { ObjectTypeDefinitionSummary } from 'src/helpers/ObjectTypeDefinitionSummary';

export class Type extends NexusObjectTypeDef<string> {
    constructor(protected readonly definition: ObjectTypeDefinitionSummary) {
        super(definition.name, {
            name: definition.name,
            description: definition.description,
            definition: (t) => this.generateFields(t),
        });
    }
    protected generateFields(t: ObjectDefinitionBlock<string>) {
        this.definition.fields.forEach((field) => {
            switch (field.type) {
                case 'ID':
                    t.id(field.name, field.nexusOptions);
                    break;
                case 'String':
                case 'File':
                case 'DateTime':
                case 'Email':
                case 'Password':
                case 'PhoneNumber':
                    t.string(field.name, field.nexusOptions);
                    break;
                case 'Boolean':
                    t.boolean(field.name, field.nexusOptions);
                    break;
                default:
                    t.field(field.name, { ...field.nexusOptions, type: Desolid.dictionary.get(field.type) });
                    break;
            }
        });
    }
}
