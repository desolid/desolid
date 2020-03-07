import { GraphQLServer } from 'graphql-yoga';
import Desolid from './Desolid';

(async function() {
    const engine = new Desolid('./test/schema.graphql');
    const schema = await engine.generateSchema();
    const server = new GraphQLServer({
        schema,
    });
    await server.start({
        port: process.env.PORT || 3000,
    });
    console.log(`Server is running on http://localhost:${server.options.port}`);
})();
