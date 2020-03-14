import { DefinitionNode } from 'graphql';
import { NexusObjectTypeDef, ObjectDefinitionBlock, enumType } from 'nexus/dist/core';
import { ObjectTypeDefinitionSummary, summarize } from '../helpers/ObjectTypeDefinitionSummary';
import { Model } from './Model';
import { EntitySchema, EntitySchemaColumnOptions, EntitySchemaRelationOptions } from 'typeorm';
import { EntitySchemaOptions } from 'typeorm/entity-schema/EntitySchemaOptions';

export class Type extends NexusObjectTypeDef<string> {
    public static readonly dictionary = new Map<string, NexusObjectTypeDef<string>>();
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
    public schema = new EntitySchemaOptions();
    constructor(protected readonly definition: ObjectTypeDefinitionSummary) {
        super(definition.name, {
            name: definition.name,
            description: definition.description,
            definition: (t) => this.generateFields(t),
        });
        this.schema.name = definition.name;
        this.schema.columns = {};
        this.schema.relations = {};
    }
    protected generateFields(t: ObjectDefinitionBlock<string>) {
        this.definition.fields.forEach((field) => {
            let column = {
                nullable: field.nexusOptions.nullable,
            } as EntitySchemaColumnOptions;
            switch (field.type) {
                case 'ID':
                    column.primary = true;
                    column.generated = true;
                    column.type = 'int';
                    t.id(field.name, field.nexusOptions);
                    break;
                case 'String':
                case 'File':
                case 'DateTime':
                case 'Email':
                case 'Password':
                case 'PhoneNumber':
                    column.type = 'varchar';
                    t.string(field.name, field.nexusOptions);
                    break;
                case 'Boolean':
                    column.type = 'boolean';
                    t.boolean(field.name, field.nexusOptions);
                    break;
                default:
                    const ref = Type.dictionary.get(field.type) as Model;
                    if (ref.isModel) {
                        column = undefined;
                        this.schema.relations[ref.name.toLowerCase()] = {
                            name: ref.name.toLowerCase(),
                            target: ref.name,
                            nullable: field.nexusOptions.nullable,
                            type: 'one-to-one',
                            cascade: true,
                        } as EntitySchemaRelationOptions;
                    } else {
                        // it's an enum type or not model type
                        column.type = 'varchar';
                    }
                    if (ref) t.field(field.name, { ...field.nexusOptions, type: ref });
                    break;
            }
            if (column) {
                this.schema.columns[field.name] = column;
            }
        });
    }
}
