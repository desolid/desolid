import {
    NexusScalarTypeDef,
    NexusEnumTypeDef,
    enumType,
    NexusInputObjectTypeDef,
    inputObjectType,
    NexusObjectTypeDef,
} from '@nexus/schema/dist/core';
import * as path from 'path';
import gql from 'graphql-tag';
import { readFileSync } from 'fs-extra';
import { TypeDefinitionNode, EnumTypeExtensionNode, DocumentNode, ObjectTypeExtensionNode } from 'graphql';
import { TypeDefinition, scalars } from '.';
import { MapX } from '../utils';
import { primitives } from './primitives.graphql';

export type EntityDefinition =
    | TypeDefinition
    | NexusObjectTypeDef<string>
    | NexusScalarTypeDef<string>
    | NexusEnumTypeDef<string>
    | NexusInputObjectTypeDef<string>;

export class Schema {
    public readonly dictionary = new MapX<string, EntityDefinition>();
    public readonly models: MapX<string, TypeDefinition>;
    /**
     * @param root root desolid directory
     */
    constructor(root: string) {
        this.dictionary.importArray(scalars, 'name');
        this.import(primitives);
        const document = this.loadDocument(path.join(root, 'schema.graphql'));
        this.import(document);
        this.models = this.dictionary.search({ isModel: true }) as MapX<string, TypeDefinition>;
    }

    public get<T = EntityDefinition>(name: string) {
        return (this.dictionary.get(name) as any) as T;
    }

    private loadDocument(path: string) {
        return gql(readFileSync(path, { encoding: 'utf8' }));
    }

    private import({ definitions }: DocumentNode) {
        definitions.forEach((definition) => this.importTypeDef(definition as TypeDefinitionNode));
    }

    private importTypeDef(definition: TypeDefinitionNode | EnumTypeExtensionNode | ObjectTypeExtensionNode) {
        let entity = this.get(definition.name.value);
        if (entity) {
            switch (definition.kind) {
                case 'EnumTypeExtension':
                    {
                        const base = entity as NexusEnumTypeDef<string>;
                        (base.value.members as string[]).push(...definition.values.map((item) => item.name.value));
                    }
                    break;
                case 'ObjectTypeExtension':
                    {
                        const base = entity as TypeDefinition;
                        base.extend(definition);
                    }
                    break;
                default:
                    throw new Error(`Conflict on "${definition.name.value}" !`);
            }
        } else {
            switch (definition.kind) {
                case 'EnumTypeDefinition':
                    entity = enumType({
                        name: definition.name.value,
                        description: definition.description?.value,
                        members: definition.values.map((item) => item.name.value),
                    });
                    break;
                case 'EnumTypeExtension':
                    const base = this.get(definition.name.value) as NexusEnumTypeDef<string>;
                    (base.value.members as string[]).push(...definition.values.map((item) => item.name.value));
                    return;
                case 'ObjectTypeDefinition':
                    entity = new TypeDefinition(this, definition);
                    break;
                default:
                    throw new Error(`Forbidden ${definition.kind}: "${definition.name.value}"`);
            }
            this.dictionary.set(entity.name, entity);
        }
        return entity;
    }
}
