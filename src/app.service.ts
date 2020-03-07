import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';

@Injectable()
export class AppService {
    async loadSchema() {
        const schema = await fs.readFile('./test/schema.graphql', { encoding: 'utf8' });
        console.log(schema);
    }
    getHello(): string {
        return 'Hello World!';
    }
}
