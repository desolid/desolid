import { TypeDefinition } from '../schema';
import { Record } from '../database';
import * as _ from 'lodash';
import { SelectAttributes } from '.';

export enum AuthorizationCategory {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

interface User {
    id: number;
    email: string;
    group: 'string';
}

interface AuthorizationCondition {
    select: { [key: string]: SelectAttributes };
    attributes: string[];
    function: ($user: User, $record: Record) => boolean;
}

export class Authorization {
    private categories: { [key in AuthorizationCategory]: AuthorizationCondition[] };

    constructor(private readonly typeDefinition: TypeDefinition) {
        this.initialize();
    }

    private initialize() {
        const definition = this.typeDefinition.directives.authorization;
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
        if (category != AuthorizationCategory.CREATE && !_.includes(attributes, 'id')) {
            attributes.push('id');
        }
        const condition = {
            attributes,
            select: this.attributesToSelect(category, attributes),
        } as AuthorizationCondition;
        if (condition.attributes.length <= 1) {
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
            // const needsAuthentication = _.includes(body, '$user.');
            condition.function = function($user: User, $record: Record) {
                try {
                    return eval(body);
                } catch (error) {
                    throw new Error(
                        `Failed executing ${category} Authorization condition: ["${condition.attributes}"] of ${this.typeDefinition.name} model. Error: ${error.message}`,
                    );
                }
            };
        }
        return condition;
    }

    private authorize(category: AuthorizationCategory, user: User, record: Record) {
        if (
            !this.categories[category].reduce((output, condition) => {
                output = output || condition.function(user, record);
                return output;
            }, false)
        ) {
            throw new Error(
                `You are not authorized to ${category.toLowerCase()} ${this.typeDefinition.name} where { id: ${
                    record.id
                } }`,
            );
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
            const field = _.find(this.typeDefinition.fields, { name });
            if (field) {
                if (field.relation) {
                    if (_.includes(field.relation.type, 'to-one')) {
                        output[name] = {
                            // Preventing overwriting on prev values
                            ...output[name],
                            name,
                            fieldsByTypeName: {
                                // Preventing overwriting on prev values
                                ...output[name]?.fieldsByTypeName,
                                name: name as any,
                                [field.relation.typeDefinition.name]: {
                                    // Preventing overwriting on prev values
                                    ...output[name]?.fieldsByTypeName[field.relation.typeDefinition.name],
                                    [innerAttribute]: {
                                        name: innerAttribute,
                                        fieldsByTypeName: {},
                                    },
                                },
                            },
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
        return this.categories[category].reduce((output, condition) => {
            return _.merge(output, condition.select);
        }, {} as { [key: string]: SelectAttributes });
    }

    create(user: User) {
        this.authorize(AuthorizationCategory.CREATE, user, undefined);
    }

    read(user: User, record: Record) {
        this.authorize(AuthorizationCategory.READ, user, record);
    }

    update(user: User, record: Record) {
        this.authorize(AuthorizationCategory.UPDATE, user, record);
    }

    delete(user: User, record: Record) {
        this.authorize(AuthorizationCategory.DELETE, user, record);
    }
}
