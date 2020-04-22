import { FieldDefinitionNode, TypeNode } from 'graphql';
import { FieldOutConfig } from '@nexus/schema/dist/core';
import { DataType } from 'sequelize/types';
import * as _ from 'lodash';
import { Scalar, DirectiveDefinition, scalarTypes, stringScalars, TypeDefinition, EntityDefinition } from '.';

export type FieldType = Scalar;

export type FieldDirectives =
    | 'authorization'
    | 'createdAt'
    | 'updatedAt'
    | 'default'
    | 'upload'
    | 'unique'
    | 'validation';

export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export class FieldDefinition {
    private _type: FieldType;
    name: string;
    databaseType: DataType;
    isScalar: boolean;
    description: string;
    directives: { [key in FieldDirectives]: any } = {} as any;
    config: FieldOutConfig<any, any>;

    constructor(definition: FieldDefinitionNode, public readonly owner: TypeDefinition) {
        const encodedFieldType = this.encodeFieldType(definition);
        const list = encodedFieldType.match(/[\w!]\]/g);
        definition.directives.forEach((item) => {
            const summary = new DirectiveDefinition(item);
            this.directives[summary.name] = summary.arguments;
        });
        this._type = encodedFieldType.replace(/[!\]]/g, '') as FieldType;
        this.name = definition.name.value;
        this.description = definition.description?.value;
        this.isScalar = scalarTypes.indexOf(this._type as Scalar) >= 0;
        this.config = {
            nullable: !/!$/.test(encodedFieldType),
            list: list ? list.map((item) => /^!/.test(item)) : false,
        } as FieldOutConfig<any, any>;
    }

    public get type() {
        if (this.isScalar) {
            return this._type;
        } else {
            return this.owner.schema.get(this._type as string);
        }
    }

    public get isString() {
        return stringScalars.indexOf(this._type as string) >= 0;
    }

    public get relation() {
        if (this.isScalar || !this.owner.isModel) return undefined;
        const right = this.type as TypeDefinition;
        if (!right.isModel) return undefined;
        const meOnTheRight = _.find(right.fields, { type: this.owner }) as FieldDefinition;
        let type: RelationType;
        if (meOnTheRight) {
            if (this.config.list) {
                type = meOnTheRight.config.list ? 'many-to-many' : 'many-to-one';
            } else {
                type = meOnTheRight.config.list ? 'one-to-many' : 'one-to-one';
            }
        } else {
            type = this.config.list ? 'many-to-many' : 'many-to-one';
        }
        return {
            model: right,
            type,
        };
    }

    private encodeFieldType(field: FieldDefinitionNode | TypeNode): string {
        switch (field.kind) {
            case 'FieldDefinition':
                return this.encodeFieldType(field.type);
            case 'NamedType':
                return field.name.value;
            case 'ListType':
                return `${this.encodeFieldType(field.type)}]`;
            case 'NonNullType':
                return `${this.encodeFieldType(field.type)}!`;
        }
    }
}
