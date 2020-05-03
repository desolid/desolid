import { DirectiveNode, StringValueNode, ValueNode } from 'graphql';

export class DirectiveDefinition {
    name: string;
    arguments: { [key: string]: any };
    constructor(directive: DirectiveNode) {
        this.name = directive.name.value;
        this.arguments = directive.arguments.reduce((output, argument) => {
            output[argument.name.value] = this.parseValue(argument.value);
            return output;
        }, {});
    }
    private parseValue(value: ValueNode) {
        switch (value.kind) {
            case 'ListValue':
                return value.values.map((item) => this.parseValue(item));
            case 'StringValue':
            case 'BooleanValue':
            case 'EnumValue':
                return value.value;
            case 'IntValue':
                return parseInt(value.value);
            case 'FloatValue':
                return parseFloat(value.value);
            case 'NullValue':
                return null;
            case 'ObjectValue':
                return value.fields.reduce((output, field) => {
                    output[field.name.value] = this.parseValue(field.value);
                    return output;
                }, {});
            case 'Variable':
                return value.name;
        }
    }
}
