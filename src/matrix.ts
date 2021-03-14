class Matrix {
    private sizeX = NaN;
    private sizeY = NaN;
    private data: Array<Array<number>> = null;

    constructor(data: Array<Array<number>>) {
        const sizeMin = data.reduce((min, cur) => cur.length < min ? cur.length : min, +Infinity);
        const sizeMax = data.reduce((max, cur) => cur.length > max ? cur.length : max, -Infinity);
        if (sizeMin !== sizeMax) {
            throw (new Error('Non-rectangular'));
        }

        this.data = data;
        this.sizeY = data.length;
        this.sizeX = sizeMax;
    }

    getWidth(): number {        
        return this.sizeX;
    }

    getHeight(): number {
        return this.sizeY;
    }

    getAt(x: number, y: number): number {
        if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY) {
            throw new Error('Out of range');
        }

        return this.data[y][x];
    }

    forEach(cb: (val: number, index: [x: number, y: number]) => void): void {
        this.data.forEach((row, y) => {
            row.forEach((val, x) => {
                cb(val, [x, y]);
            });
        });
    }

    neighborIndexesOf(x: number, y: number): [number, number][] {
        if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY) {
            throw new Error('Out of range');
        }

        const offsets = [];
        if (x > 0) {
            offsets.push([-1, 0]);
            if (y > 0) {
                offsets.push([-1, -1]);
            }
            if (y + 1 < this.sizeY) {
                offsets.push([-1, +1]);
            }
        }
        if (x + 1 < this.sizeX) {
            offsets.push([+1, 0]);
            if (y > 0) {
                offsets.push([+1, -1]);
            }
            if (y + 1 < this.sizeY) {
                offsets.push([+1, +1]);
            }
        }
        if (y > 0) {
            offsets.push([0, -1]);
        }
        if (y + 1 < this.sizeY) {
            offsets.push([0, +1]);
        }
        return offsets.map(([offX, offY]) => [x + offX, y + offY]);
    }
}

export default Matrix;
