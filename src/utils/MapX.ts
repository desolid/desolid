export class MapX<K, V> extends Map<K, V> {
    public get<T = V>(key: K) {
        return (super.get(key) as any) as T;
    }

    public importArray(array: V[], uniqueAttribute: string) {
        array.forEach((item) => {
            this.set(item[uniqueAttribute], item);
        });
    }

    public filter(by: (value: V, key: K) => any | { [key: string]: V }) {
        const result = new MapX<K, V>();
        for (const [key, value] of this) {
            if ((by instanceof Function && by(value, key)) || by[(key as any) as string] === value) {
                result.set(key, value);
            }
        }
        return result;
    }

    public reduce<T = any>(callback: (previousValue: T, currentValue: V) => T, initialValue: T = {} as any) {
        for (const [key, value] of this) {
            callback(initialValue, value);
        }
        return initialValue;
    }

    public merge(map: MapX<K, V>) {
        for (const [key, value] of map) {
            map.set(key, value);
        }
    }

    public toValues() {
        return [...this.values()];
    }

    public toKeys() {
        return [...this.keys()];
    }

    public toObject() {
        const output = {} as { [key: string]: V };
        this.forEach((value, key) => {
            output[key.toString()] = value;
        });
        return output;
    }

    public search(where: any) {
        return this.filter((value) => {
            return Object.keys(where).reduce((output, key) => {
                return output && value[key] == where[key];
            }, true);
        });
    }

    public find(where: any) {
        return this.search(where).first();
    }

    public first() {
        return this.get(this.toKeys().shift());
    }

    public last() {
        return this.get(this.toKeys().pop());
    }

    public map(callback: (value: V, key: K) => any) {
        const result = [];
        this.forEach((value, key) => {
            result.push(callback(value, key));
        });
        return result;
    }
}
