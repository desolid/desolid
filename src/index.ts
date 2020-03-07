import { queryType, stringArg, makeSchema } from 'nexus';
import { GraphQLServer } from 'graphql-yoga';

const Query = queryType({
    definition(t) {
        t.string('hello', {
            args: { name: stringArg({ nullable: true }) },
            resolve: (parent, { name }) => `Hello ${name || 'World'}!`,
        });
    },
});

const schema = makeSchema({
    types: [Query],
    outputs: {
        // schema: __dirname + '/generated/schema.graphql',
        // typegen: __dirname + '/generated/typings.ts',
    },
});

const server = new GraphQLServer({
    schema,
});

server.start(
    {
        port: process.env.PORT || 3000,
    },
    ({ port }) => console.log(`Server is running on http://localhost:${port}`),
);
