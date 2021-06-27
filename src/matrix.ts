import { Matrix } from 'ml-matrix';

class MyMatrix {
    private sizeX = NaN;
    private sizeY = NaN;
    private data: Matrix = null;

    constructor(data: Array<Array<number>>) {
        const sizeMin = data.reduce((min, cur) => cur.length < min ? cur.length : min, +Infinity);
        const sizeMax = data.reduce((max, cur) => cur.length > max ? cur.length : max, -Infinity);
        if (sizeMin !== sizeMax) {
            throw (new Error('Non-rectangular'));
        }

        this.data = new Matrix(data);
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

        return this.data.get(y, x);
    }

    forEach(cb: (val: number, index: [x: number, y: number]) => void): void {
        this.data.to2DArray().forEach((row, y) => {
            row.forEach((val, x) => {
                cb(val, [x, y]);
            });
        });
    }

    toArray(): number[] {
        return this.data.to1DArray();
    }

    toMultiDimensionalArray(): Array<number[]> {
        return this.data.to2DArray();
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

    getColumn(index: number): MyMatrix {
        if (index < 0 || index >= this.sizeX) {
            throw new Error('Out of range');
        }

        return new MyMatrix(this.data.getColumn(index).map(scalar => [scalar]));
    }

    getRow(index: number): MyMatrix {
        if (index < 0 || index >= this.sizeY) {
            throw new Error('Out of range');
        }

        return new MyMatrix([this.data.getRow(index)]);
    }

    dotProduct(other: MyMatrix): number {
        if (this.sizeX !== other.sizeY) {
            throw new Error('Bad size');
        }

        return this.data.dot(other.data);
    }

    mulMatrix(other: MyMatrix): MyMatrix {
        if (this.sizeX !== other.sizeY) {
            throw new Error('Bad size');
        }

        return new MyMatrix(this.data.mmul(other.data).to2DArray());
    }

    mulScalar(scalar: number): MyMatrix {
        return new MyMatrix(Matrix.mul(this.data, scalar).to2DArray());
    }

    transpose(): MyMatrix {
        return new MyMatrix(this.data.transpose().to2DArray());
    }
}

export default MyMatrix;
