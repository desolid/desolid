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
            definition: (t) => this.typeDef.forEach(({ name, config }) => t.field(name, config)),
        });
    }
    private get typeDef() {
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
    // protected graphQLSchema2(t: ObjectDefinitionBlock<string>) {
    //     this.definition.fields.forEach((field) => {
    //         let column = {
    //             nullable: field.config.nullable,
    //         } as EntitySchemaColumnOptions;
    //         switch (field.type) {
    //             case 'ID':
    //                 column.primary = true;
    //                 column.generated = true;
    //                 column.type = 'int';
    //                 t.id(field.name, field.config);
    //                 break;
    //             case 'String':
    //             case 'File':
    //             case 'DateTime':
    //             case 'Email':
    //             case 'Password':
    //             case 'PhoneNumber':
    //                 column.type = 'varchar';
    //                 t.string(field.name, field.config);
    //                 break;
    //             case 'Boolean':
    //                 column.type = 'boolean';
    //                 t.boolean(field.name, field.config);
    //                 break;
    //             default:
    //                 const ref = Type.dictionary.get(field.type) as Model;
    //                 if (ref.isModel) {
    //                     column = undefined;
    //                     this.schema.relations[ref.name.toLowerCase()] = {
    //                         name: ref.name.toLowerCase(),
    //                         target: ref.name,
    //                         nullable: field.config.nullable,
    //                         type: 'one-to-one',
    //                         cascade: true,
    //                     } as EntitySchemaRelationOptions;
    //                 } else {
    //                     // it's an enum type or not model type
    //                     column.type = 'varchar';
    //                 }
    //                 if (ref) t.field(field.name, { ...field.config, type: ref });
    //                 break;
    //         }
    //         if (column) {
    //             this.schema.columns[field.name] = column;
    //         }
    //     });
    }
}
