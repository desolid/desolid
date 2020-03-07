import { ObjectTypeDefinitionNode, FieldDefinitionNode, TypeNode } from 'graphql';
import { NexusObjectTypeDef, ObjectDefinitionBlock } from 'nexus/dist/core';
import Desolid from '../Desolid';

export class Model extends NexusObjectTypeDef<string> {
    constructor(protected readonly definition: ObjectTypeDefinitionNode) {
        super(definition.name.value, {
            name: definition.name.value,
            description: definition.description?.value,
            definition: (t) => this.generateFields(t),
        });
    }
    private getFieldType(field: FieldDefinitionNode | TypeNode): string {
        switch (field.kind) {
            case 'FieldDefinition':
                return this.getFieldType(<any>field.type);
            case 'NamedType':
                return field.name.value;
            case 'ListType':
                return `${this.getFieldType(<any>field.type)}]`;
            case 'NonNullType':
                return `${this.getFieldType(<any>field.type)}!`;
        }
    }
    private generateFields(t: ObjectDefinitionBlock<string>) {
        this.definition.fields.forEach((field) => {
            let type = this.getFieldType(field);
            const list = type.match(/[\w!]\]/g);
            const options = <any>{
                nullable: !/!$/.test(type),
                list: list ? list.map((item) => /^!/.test(item)) : false,
            };
            type = type.replace(/[!\]]/g, '');
            switch (type) {
                case 'ID':
                    t.id(field.name.value, options);
                    break;
                case 'String':
                case 'File':
                case 'DateTime':
                case 'Email':
                case 'Password':
                case 'PhoneNumber':
                    t.string(field.name.value, options);
                    break;
                case 'Boolean':
                    t.boolean(field.name.value, options);
                    break;
                default:
                    t.field(field.name.value, { ...options, type: Desolid.dictionary.get(type) });
                    break;
            }
        });
    }
    public createQuery(t: ObjectDefinitionBlock<string>) {
        t.list.field(`${this.name.toLowerCase()}s`, {
            type: Desolid.dictionary.get(this.name),
        });
    }
}
