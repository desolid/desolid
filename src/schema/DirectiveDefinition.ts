import { DirectiveNode, StringValueNode } from 'graphql';

export class DirectiveDefinition {
    name: string;
    arguments: { [key: string]: any };
    constructor(directive: DirectiveNode) {
        this.name = directive.name.value;
        this.arguments = directive.arguments.reduce((output, argument) => {
            output[argument.name.value] = (argument.value as StringValueNode).value;
            return output;
        }, {});
    }
}
