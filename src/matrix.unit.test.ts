import { strict as assert } from 'assert';
import Matrix from './matrix';

describe('Matrix', () => {
    describe('Constructor', () => {
        it('Throws on non-rectangular', () => {
            const nonRect = [[0], [0, 1]];
            assert.throws(() => {
                new Matrix(nonRect);
            });
        });
    });

    describe('getWidth()', () => {
        it('Handles simple case', () => {
            const matrix = new Matrix([[0]]);
            assert.strictEqual(matrix.getWidth(), 1);
        });

        it('Handles long rectangle', () => {
            const matrix = new Matrix([[0, 1]]);
            assert.strictEqual(matrix.getWidth(), 2);
        });

        it('Handles high rectangle', () => {
            const matrix = new Matrix([[0], [1]]);
            assert.strictEqual(matrix.getWidth(), 1);
        });

        it('Handles square', () => {
            const matrix = new Matrix([[0, 1], [1, 0]]);
            assert.strictEqual(matrix.getWidth(), 2);
        });
    });
    
    describe('getHeight()', () => {
        it('Handles simple case', () => {
            const matrix = new Matrix([[0]]);
            assert.strictEqual(matrix.getHeight(), 1);
        });

        it('Handles long rectangle', () => {
            const matrix = new Matrix([[0, 1]]);
            assert.strictEqual(matrix.getHeight(), 1);
        });

        it('Handles high rectangle', () => {
            const matrix = new Matrix([[0], [1]]);
            assert.strictEqual(matrix.getHeight(), 2);
        });

        it('Handles square', () => {
            const matrix = new Matrix([[0, 1], [1, 0]]);
            assert.strictEqual(matrix.getHeight(), 2);
        });
    });

    describe('getAt()', () => {
        it('Throws if x < 0', () => {
            const matrix = new Matrix([[0]]);
            assert.throws(() => {
                matrix.getAt(-1, 0);
            });
        });

        it('Throws if y < 0', () => {
            const matrix = new Matrix([[0]]);
            assert.throws(() => {
                matrix.getAt(0, -1);
            });
        });

        it('Throws if x < 0 & y < 0', () => {
            const matrix = new Matrix([[0]]);
            assert.throws(() => {
                matrix.getAt(-1, -1);
            });
        });

        it('Throws if x > width', () => {
            const matrix = new Matrix([[0]]);
            assert.throws(() => {
                matrix.getAt(1, 0);
            });
        });

        it('Throws if y > height', () => {
            const matrix = new Matrix([[0]]);
            assert.throws(() => {
                matrix.getAt(0, 1);
            });
        });

        it('Throws if x > width & y > height', () => {
            const matrix = new Matrix([[0]]);
            assert.throws(() => {
                matrix.getAt(1, 1);
            });
        });

        it('Gets correctly', () => {
            const arr = [];
            const getValue = (x: number, y: number) => Math.sin(x + y);
            for (let i = 0; i < 8; ++i) {
                const inArr = [];
                for (let j = 0; j < 8; ++j) {
                    inArr.push(getValue(j, i));
                }
                arr.push(inArr);
            }
            const matrix = new Matrix(arr);
            for (let i = 0; i < 8; ++i) {
                for (let j = 0; j < 8; ++j) {
                    assert.strictEqual(matrix.getAt(j, i), getValue(j, i));
                }
            }
        });
    });

    describe('forEach', () => {
        it('Calls each once', () => {
            const arr = [];
            const getValue = (x: number, y: number) => Math.sin(x + y);
            for (let i = 0; i < 8; ++i) {
                const inArr = [];
                for (let j = 0; j < 8; ++j) {
                    inArr.push(getValue(j, i));
                }
                arr.push(inArr);
            }
            const matrix = new Matrix(arr);
            const called = new Map();
            matrix.forEach((val, [x, y]) => {
                const key = JSON.stringify([x, y]);
                assert.strictEqual(called.has(key), false, 'Calls more than once');
                called.set(key, val);
            });
            for (let i = 0; i < 8; ++i) {
                for (let j = 0; j < 8; ++j) {
                    const key = JSON.stringify([j, i]);
                    assert.strictEqual(called.has(key), true, 'Doesn\'t call one of');
                    assert.strictEqual(called.get(key), getValue(j, i), 'Calls with wrong value');
                }
            }
        });
    });

    describe('getColumn', () => {
        const testData = new Matrix([
            [3, 5],
            [7, 11],
        ]);

        it('Throws if index < 0', () => {
            assert.throws(() => {
                testData.getColumn(-1);
            });
        });

        it('Throws if index > sizeX', () => {
            assert.throws(() => {
                testData.getColumn(2);
            });
        });

        it('Returns correct vertical vector', () => {
            const actual = testData.getColumn(1);
            assert.strictEqual(actual.getHeight(), 2);
            assert.strictEqual(actual.getWidth(), 1);
            assert.strictEqual(actual.getAt(0, 0), 5);
            assert.strictEqual(actual.getAt(0, 1), 11);
        });
    });
    
    describe('getRow', () => {
        const testData = new Matrix([
            [3, 5],
            [7, 11],
        ]);

        it('Throws if index < 0', () => {
            assert.throws(() => {
                testData.getRow(-1);
            });
        });

        it('Throws if index > sizeY', () => {
            assert.throws(() => {
                testData.getRow(2);
            });
        });

        it('Returns correct horizontal vector', () => {
            const actual = testData.getRow(1);
            assert.strictEqual(actual.getHeight(), 1);
            assert.strictEqual(actual.getWidth(), 2);
            assert.strictEqual(actual.getAt(0, 0), 7);
            assert.strictEqual(actual.getAt(1, 0), 11);
        });
    });

    describe('dotProduct', () => {
        it('Throws for 1,2 * 1,2', () => {
            const mat1 = new Matrix([
                [0, 0],
            ]);
            const mat2 = new Matrix([
                [0, 0],
            ]);
            assert.throws(() => {
                mat1.dotProduct(mat2);
            });
        });

        it('Throws for 2,1 * 2,1', () => {
            const mat1 = new Matrix([
                [0],
                [0],
            ]);
            const mat2 = new Matrix([
                [0],
                [0],
            ]);
            assert.throws(() => {
                mat1.dotProduct(mat2);
            });
        });

        it('Throws for 2,1 * 2,3', () => {
            const mat1 = new Matrix([
                [0],
                [0],
            ]);
            const mat2 = new Matrix([
                [0, 0, 0],
                [0, 0, 0],
            ]);
            assert.throws(() => {
                mat1.dotProduct(mat2);
            });
        });

        it('Throws for 1,2 * 2,3', () => {
            const mat1 = new Matrix([
                [0, 0],
            ]);
            const mat2 = new Matrix([
                [0, 0, 0],
                [0, 0, 0],
            ]);
            assert.throws(() => {
                mat1.dotProduct(mat2);
            });
        });

        it('Calculates case1 correctly', () => {
            const mat1 = new Matrix([
                [1, 2, 3],
                [4, 5, 6],
            ]);
            const mat2 = new Matrix([
                [7, 8],
                [9, 10],
                [11, 12],
            ]);
            const expected = new Matrix([
                [58, 64],
                [139, 154],
            ]);
            const actual = mat1.dotProduct(mat2);
            assert.strictEqual(actual.getWidth(), expected.getWidth());
            assert.strictEqual(actual.getHeight(), expected.getHeight());
            for (let i = 0; i < actual.getHeight(); ++i) {
                for (let j = 0; j < actual.getWidth(); ++j) {
                    assert.strictEqual(actual.getAt(j, i), expected.getAt(j, i));
                }
            }
        });
    });

    describe('mulScalar', () => {
        it('Calculates case1 correctly', () => {
            const mat = new Matrix([
                [3, 5],
                [7, 11],
            ]);
            const scalar = 1;
            const expected = mat;
            const actual = mat.mulScalar(scalar);
            assert.strictEqual(actual.getWidth(), expected.getWidth());
            assert.strictEqual(actual.getHeight(), expected.getHeight());
            for (let i = 0; i < actual.getHeight(); ++i) {
                for (let j = 0; j < actual.getWidth(); ++j) {
                    assert.strictEqual(actual.getAt(j, i), expected.getAt(j, i));
                }
            }
        });

        it('Calculates case2 correctly', () => {
            const mat = new Matrix([
                [3, 5],
                [7, 11],
            ]);
            const scalar = 2;
            const expected = new Matrix([
                [6, 10],
                [14, 22],
            ]);
            const actual = mat.mulScalar(scalar);
            assert.strictEqual(actual.getWidth(), expected.getWidth());
            assert.strictEqual(actual.getHeight(), expected.getHeight());
            for (let i = 0; i < actual.getHeight(); ++i) {
                for (let j = 0; j < actual.getWidth(); ++j) {
                    assert.strictEqual(actual.getAt(j, i), expected.getAt(j, i));
                }
            }
        });
    });
});
