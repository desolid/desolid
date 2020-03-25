import { GraphQLResolveInfo } from 'graphql';
import { ObjectDefinitionBlock, arg, stringArg, ScalarArgConfig, NexusArgDef, intArg } from 'nexus/dist/core';
import { Repository } from 'typeorm';
import * as pluralize from 'pluralize';
import { Type, Schema, TypeDefinition } from '.';

export class Model extends Type {
    public repository: Repository<any>;
    constructor(definition: TypeDefinition, schema: Schema) {
        super(definition, schema, 'model');
    }
    public setRepository(repository: Repository<any>) {
        this.repository = repository;
    }
    private generateFindOneArgs() {
        const output: { [key: string]: NexusArgDef<any> } = {};
        const uniqueFields = this.definition.fields.filter((field) => field.type == 'ID' || field.directives.unique);
        uniqueFields.forEach((field) => {
            let arg: NexusArgDef<any>;
            const options: ScalarArgConfig<any> = {
                required: false,
            };
            switch (field.databaseType) {
                case 'int':
                    arg = intArg(options);
                    break;
                default:
                    arg = stringArg(options);
            }
            output[field.name] = arg;
        });
        return output;
    }
    public getQueries(t: ObjectDefinitionBlock<string>) {
        t.field(this.name.toLowerCase(), {
            type: this,
            args: this.generateFindOneArgs(),
            resolve: this.findOne.bind(this),
        });
        t.list.field(pluralize(this.name.toLowerCase()), {
            type: this,
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
