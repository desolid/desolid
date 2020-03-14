import { DefinitionNode } from 'graphql';
import { NexusObjectTypeDef, ObjectDefinitionBlock, enumType } from 'nexus/dist/core';
import { ObjectTypeDefinitionSummary, summarize } from '../helpers/ObjectTypeDefinitionSummary';
import { Model } from './Model';

export class Type extends NexusObjectTypeDef<string> {
    public static readonly dictionary = new Map<string, any>();
    public static import(definitions: readonly DefinitionNode[]) {
        const models: Model[] = [];
        definitions.forEach((definition) => {
            let typeDef: any;
            switch (definition.kind) {
                case 'EnumTypeDefinition':
                    typeDef = enumType({
                        name: definition.name.value,
                        description: definition.description?.value,
                        members: definition.values.map((item) => item.name.value),
                    });
                    break;
                case 'ObjectTypeDefinition':
                    const definitionSummary = summarize(definition);
                    if (Model.isModel(definitionSummary)) {
                        typeDef = new Model(definitionSummary);
                        models.push(typeDef);
                    } else {
                        typeDef = new Type(definitionSummary);
                    }
                default:
                    break;
            }
            this.dictionary.set(typeDef.name, typeDef);
        });
        return models;
    }
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
                    t.field(field.name, { ...field.nexusOptions, type: Type.dictionary.get(field.type) });
                    break;
            }
        });
    }
}
