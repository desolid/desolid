import { GraphQLResolveInfo } from 'graphql';
import {
    ObjectDefinitionBlock,
    arg,
    stringArg,
    ScalarArgConfig,
    NexusArgDef,
    intArg,
    inputObjectType,
} from 'nexus/dist/core';
import { Repository } from 'typeorm';
import * as pluralize from 'pluralize';
import { Schema, TypeDefinition } from '..';
import { WhereInput, WhereUniqueInput, Type, OrderBy } from '.';

export class Model extends Type {
    public repository: Repository<any>;
    private inputs: {
        where: WhereInput;
        uniqueWhere: WhereUniqueInput;
        orderBy: OrderBy;
    } = {} as any;
    constructor(definition: TypeDefinition, schema: Schema) {
        super(definition, schema, 'model');
        this.inputs.where = new WhereInput(this, schema);
        this.inputs.uniqueWhere = new WhereUniqueInput(this, schema);
        this.inputs.orderBy = new OrderBy(this);
    }
    public setRepository(repository: Repository<any>) {
        this.repository = repository;
    }
    public getQueries(t: ObjectDefinitionBlock<string>) {
        t.field(this.name.toLowerCase(), {
            type: this,
            // args: this.generateFindOneArgs(),
            args: { where: this.inputs.uniqueWhere },
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.name.toLowerCase()), {
            type: this,
            args: {
                where: this.inputs.where,
                orderBy: this.inputs.orderBy,
                skip: intArg(),
                after: stringArg(),
                before: stringArg(),
                first: intArg(),
                last: intArg(),
            },
            resolve: this.find.bind(this),
        });
    }

    public getMutations(t: ObjectDefinitionBlock<string>) {
        t.field(`create${this.name}`, {
            type: this,
            resolve: this.createOne.bind(this),
        });
        t.field(`update${this.name}`, {
            type: this,
            nullable: true,
            resolve: this.updateOne.bind(this),
        });
        t.list.field(`updateMany${pluralize(this.name)}`, {
            type: this,
            nullable: true,
            resolve: this.updateMany.bind(this),
        });
        t.field(`delete${this.name}`, {
            type: this,
            nullable: true,
            resolve: this.deleteOne.bind(this),
        });
        t.list.field(`deleteMany${pluralize(this.name)}`, {
            type: this,
            nullable: true,
            resolve: this.deleteMany.bind(this),
        });
    }
    private createOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private updateOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private updateMany(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private deleteOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private deleteMany(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private find(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
    private findOne(root: any, args: any, context: any, info: GraphQLResolveInfo): any {
        debugger;
    }
}
