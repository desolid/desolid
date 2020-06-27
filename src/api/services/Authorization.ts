import { TypeDefinition } from '../../schema';
import { Record } from '../../database';
import * as _ from 'lodash';
import { SelectAttributes } from '..';
import { AuthenticationError } from 'apollo-server-core';

export enum AuthorizationCategory {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export interface User extends Record {
    name: string;
    family: string;
    email: string;
    group: string;
}

interface AuthorizationCondition {
    select: { [key: string]: SelectAttributes };
    attributes: string[];
    function: ($user: User, $record: Record, $input?: any) => boolean;
}

export class Authorization {
    private categories: { [key in AuthorizationCategory]: AuthorizationCondition[] };

    constructor(private readonly typeDefinition: TypeDefinition) {
        this.initialize();
    }

    private initialize() {
        const definition = this.typeDefinition.directives.get('authorization');
        if (definition) {
            this.categories = Object.values(AuthorizationCategory).reduce((output, category) => {
                const rules = definition[category];
                if (rules) {
                    output[category] = [];
                    rules.forEach((rule: string) => {
                        output[category].push(this.parseCondition(rule, category));
                    });
                }
                return output;
            }, {} as any);
        }
    }

    private parseCondition(rule: string, category: AuthorizationCategory) {
        const attributes = rule.match(/{{[{]?(.*?)[}]?}}/g)?.map((item) => item.replace(/[{}]/g, '')) || [];
        const isByGroup = attributes.length == 0;
        if (category != AuthorizationCategory.CREATE && !_.includes(attributes, 'id')) {
            // `id` is needed for error reporting, that on which record user doesn't have permission
            attributes.push('id');
        }
        const condition = {
            attributes,
            select: this.attributesToSelect(category, attributes),
        } as AuthorizationCondition;
        if (isByGroup) {
            // Use group based conditions
            condition.function = function($user: User) {
                if ($user) {
                    return $user.group == rule;
                } else {
                    return false;
                }
            };
        } else if (category == AuthorizationCategory.CREATE) {
            throw new Error(`Wrong ${category} Authorization conditions on ${this.typeDefinition.name} model.`);
        } else {
            let body = rule;
            condition.attributes.forEach((attribute) => {
                body = body.replace(`{{${attribute}}}`, `$record.${attribute}`);
            });
            let func;
            try {
                func = Function(`"use strict"; return ( function ($user, $record, $input) { return ${body}; } );`)();
            } catch (error) {
                throw new Error(
                    `Failed compiling ${category} Authorization condition: \`${rule}\` of ${this.typeDefinition.name} model. ${error.message}.`,
                );
            }
            // const needsAuthentication = _.includes(body, '$user.');
            condition.function = ($user: User, $record: Record, $input?: any) => {
                try {
                    return func($user, $record, $input);
                } catch (error) {
                    throw new Error(
                        `Failed executing ${category} Authorization condition: \`${rule}\` of ${this.typeDefinition.name} model. ${error.message}.`,
                    );
                }
            };
        }
        return condition;
    }

    protected async authorize(category: AuthorizationCategory, user: User, record: Record, input?: any) {
        const conditions = this.categories[category];
        if (
            conditions &&
            !conditions.reduce((output, condition) => {
                output = output || condition.function(user, record, input);
                return output;
            }, false)
        ) {
            throw new AuthenticationError(`You are not authorized to ${category} a ${this.typeDefinition.name}.`);
        }
    }

    private attributesToSelect(category: AuthorizationCategory, attributes: string[]) {
        const errorMessagesPrefix = `Wrong ${category} Authorization conditions on ${this.typeDefinition.name} model.`;
        const output = {} as { [key: string]: SelectAttributes };
        attributes.forEach((attribute) => {
            const parts = attribute.split('.');
            if (parts.length > 2) {
                throw new Error(
                    `${errorMessagesPrefix} Only one level of inner relation attributes is allowd: "${attribute}".`,
                );
            }
            const [name, innerAttribute] = parts;
            const field = this.typeDefinition.fields.find({ name });
            if (field) {
                if (field.relationType) {
                    if (field.isToOneRelation) {
                        const relation = field.type as TypeDefinition;
                        output[name] = {
                            // Preventing overwriting on prev values
                            ...output[name],
                            name,
                            fieldsByTypeName: {
                                // Preventing overwriting on prev values
                                ...output[name]?.fieldsByTypeName,
                                [relation.name]: {
                                    // Preventing overwriting on prev values
                                    ...output[name]?.fieldsByTypeName[relation.name],
                                    [innerAttribute]: {
                                        name: innerAttribute,
                                        fieldsByTypeName: {},
                                    },
                                },
                            } as any,
                        };
                    } else {
                        throw new Error(
                            `${errorMessagesPrefix} using "${name}" in the conditions expression is not possible.`,
                        );
                    }
                } else if (output[name]) {
                    return;
                } else {
                    output[name] = {
                        name,
                        fieldsByTypeName: {},
                    };
                }
            } else {
                throw new Error(`${errorMessagesPrefix} "${name}" does't exists on ${this.typeDefinition.name}`);
            }
        });
        return output;
    }

    getSelectOf(category: AuthorizationCategory) {
        // In case of skipping an authorization category, it will return `{}`
        if (!this.categories || !this.categories[category]) {
            return {};
        } else {
            return this.categories[category].reduce((output, condition) => {
                return _.merge(output, condition.select);
            }, {} as { [key: string]: SelectAttributes });
        }
    }

    async create(user: User, input: any) {
        await this.authorize(AuthorizationCategory.CREATE, user, undefined, input);
    }

    async read(user: User, record: Record) {
        await this.authorize(AuthorizationCategory.READ, user, record);
    }

    async update(user: User, record: Record, input: any) {
        await this.authorize(AuthorizationCategory.UPDATE, user, record, input);
    }

    async delete(user: User, record: Record) {
        await this.authorize(AuthorizationCategory.DELETE, user, record);
    }

    async createMany(user: User, inputs: any[]) {
        await Promise.all(inputs.map((input) => this.authorize(AuthorizationCategory.CREATE, user, undefined, input)));
    }

    async readAll(user: User, records: Record[]) {
        await Promise.all(records.map((record) => this.authorize(AuthorizationCategory.READ, user, record)));
    }

    async updateMany(user: User, records: Record[], input: any) {
        await Promise.all(records.map((record) => this.authorize(AuthorizationCategory.UPDATE, user, record, input)));
    }

    async deleteMany(user: User, records: Record[]) {
        await Promise.all(records.map((record) => this.authorize(AuthorizationCategory.DELETE, user, record)));
    }
}
