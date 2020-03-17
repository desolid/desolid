import { GraphQLResolveInfo } from 'graphql';
import { ObjectDefinitionBlock } from 'nexus/dist/core';
import { Repository } from 'typeorm';
import * as pluralize from 'pluralize';
import { ObjectTypeDefinitionSummary } from '../helpers/TypeDefinitionSummary';
import Type from './Type';

export default class extends Type {
    public type = 'model';
    public repository: Repository<any>;
    constructor(public readonly definition: ObjectTypeDefinitionSummary) {
        super(definition);
    }
    public setRepository(repository: Repository<any>) {
        this.repository = repository;
    }
    public getQueries(t: ObjectDefinitionBlock<string>) {
        t.field(this.name.toLowerCase(), {
            type: Type.dictionary.get(this.name),
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.name.toLowerCase()), {
            type: Type.dictionary.get(this.name),
            resolve: this.find.bind(this),
        });
    }

    public getMutations(t: ObjectDefinitionBlock<string>) {
        t.field(`create${this.name}`, {
            type: Type.dictionary.get(this.name),
            resolve: this.createOne.bind(this),
        });
        t.field(`update${this.name}`, {
            type: Type.dictionary.get(this.name),
            nullable: true,
            resolve: this.updateOne.bind(this),
        });
        t.list.field(`updateMany${pluralize(this.name)}`, {
            type: Type.dictionary.get(this.name),
            nullable: true,
            resolve: this.updateMany.bind(this),
        });
        t.field(`delete${this.name}`, {
            type: Type.dictionary.get(this.name),
            nullable: true,
            resolve: this.deleteOne.bind(this),
        });
        t.list.field(`deleteMany${pluralize(this.name)}`, {
            type: Type.dictionary.get(this.name),
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
