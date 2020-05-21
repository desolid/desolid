export class Pipeline<I, O> {
    private readonly passages: (({ prev: O, args: I }) => O)[] = [];
    constructor() {}

    public pipe(passage: ({ prev: O, args: I }) => O) {
        this.passages.push(passage);
    }

    public async process(args: I, defaultOutput: O = undefined) {
        return this.passages.reduce(async (accum, passage) => {
            const prev = await accum;
            return passage({ prev, args });
        }, Promise.resolve<O>(defaultOutput));
    }
}
