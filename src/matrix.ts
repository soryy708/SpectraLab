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

    toArray(): number[] {
        return [...this.data.reduce((prev, cur) => [...prev, ...cur], [])];
    }

    toMultiDimensionalArray(): Array<number[]> {
        return [...this.data.map(arr => [...arr])];
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

    cardinalNeighborIndexesOf(x: number, y: number): [number, number][] {
        if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY) {
            throw new Error('Out of range');
        }

        const offsets = [];
        if (x > 0) {
            offsets.push([-1, 0]);
        }
        if (y > 0) {
            offsets.push([0, -1]);
        }
        if (x + 1 < this.sizeX) {
            offsets.push([1, 0]);
        }
        if (y + 1 < this.sizeY) {
            offsets.push([0, 1]);
        }
        return offsets.map(([offX, offY]) => [x + offX, y + offY]);
    }

    getColumn(index: number): Matrix {
        if (index < 0 || index >= this.sizeX) {
            throw new Error('Out of range');
        }

        const vector: Array<number> = [];
        for (let i = 0; i < this.sizeY; ++i) {
            vector.push(this.data[i][index]);
        }
        return new Matrix(vector.map(scalar => [scalar]));
    }

    getRow(index: number): Matrix {
        if (index < 0 || index >= this.sizeY) {
            throw new Error('Out of range');
        }

        const vector: Array<number> = [];
        for (let i = 0; i < this.sizeX; ++i) {
            vector.push(this.data[index][i]);
        }
        return new Matrix([vector]);
    }

    dotProduct(other: Matrix): Matrix {
        if (this.sizeX !== other.sizeY) {
            throw new Error('Bad size');
        }

        const newData: Array<Array<number>> = [];
        for (let myRow = 0; myRow < this.sizeY; ++myRow) {
            const row: Array<number> = [];
            for (let otherColumn = 0; otherColumn < other.sizeX; ++otherColumn) {
                let sum = 0;
                // Worth noting: this.sizeX == other.sizeY
                for (let i = 0; i < this.sizeX; ++i) {
                    sum += this.data[myRow][i] * other.data[i][otherColumn];
                }
                row.push(sum);
            }
            newData.push(row);
        }
        return new Matrix(newData);
    }

    mulScalar(scalar: number): Matrix {
        const newData: Array<Array<number>> = [];
        for (let i = 0; i < this.sizeY; ++i) {
            const row: Array<number> = [];
            for (let j = 0; j < this.sizeX; ++j) {
                row.push(this.data[i][j] * scalar);
            }
            newData.push(row);
        }
        return new Matrix(newData);
    }

    transpose(): Matrix {
        const newData: Array<Array<number>> = [];
        for (let i = 0; i < this.sizeX; ++i) {
            const row: Array<number> = [];
            for (let j = 0; j < this.sizeY; ++j) {
                row.push(this.data[j][i]);
            }
            newData.push(row);
        }
        return new Matrix(newData);
    }
}

export default Matrix;
