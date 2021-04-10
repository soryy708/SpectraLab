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
});
