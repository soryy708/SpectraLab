import Matrix from './matrix';

export function hilbertNodaTransformationMatrix(size: number): Matrix {
    const data: Array<Array<number>> = [];
    for (let j = 0; j < size; ++j) {
        const row: Array<number> = [];
        for (let k = 0; k < size; ++k) {
            row.push(j === k ? 0 : (1 / (Math.PI * (k-j))));
        }
        data.push(row);
    }
    return new Matrix(data);
}

function synchronous(matrix: Matrix): Matrix {
    const newMatrix: Array<Array<number>> = [];
    const height = matrix.getHeight();
    const width = matrix.getWidth();

    for (let i = 0; i < height; ++i) {
        const row: Array<number> = [];
        for (let j = 0; j < height; ++j) {
            const yTilda1 = matrix.getRow(i);
            const yTilda2 = matrix.getRow(j).transpose();
            const phi = 1 / (width-1) * yTilda1.dotProduct(yTilda2).getAt(0, 0);
            row.push(phi);
        }
        newMatrix.push(row);
    }
    return new Matrix(newMatrix);
}

function asynchronous(matrix: Matrix): Matrix {const newMatrix: Array<Array<number>> = [];
    const height = matrix.getHeight();
    const width = matrix.getWidth();
    const N = hilbertNodaTransformationMatrix(width);

    for (let i = 0; i < height; ++i) {
        const row: Array<number> = [];
        for (let j = 0; j < height; ++j) {
            const yTilda1 = matrix.getRow(i);
            const yTilda2 = matrix.getRow(j).transpose();
            const psi = 1 / (width-1) * yTilda1.dotProduct(N.dotProduct(yTilda2)).getAt(0, 0);
            row.push(psi);
        }
        newMatrix.push(row);
    }
    return new Matrix(newMatrix);
}

export default {
    synchronous,
    asynchronous,
};
