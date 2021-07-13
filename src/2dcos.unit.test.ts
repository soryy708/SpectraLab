import { strict as assert } from 'assert';
import Matrix from './matrix';
import { hilbertNodaTransformationMatrix, synchronous } from './2dcos';

describe('2dcos', () => {
    describe('hilbertNodaTransformationMatrix', () => {
        it('Calculates case1 correctly', () => {
            const expected = (new Matrix([
                [0, 1, 1 / 2, 1 / 3],
                [-1, 0, 1, 1 / 2],
                [-1 / 2, -1, 0, 1],
                [-1 / 3, -1 / 2, -1, 0],
            ])).mulScalar(1 / Math.PI);
            const actual = hilbertNodaTransformationMatrix(4);
            assert.strictEqual(actual.getWidth(), expected.getWidth());
            assert.strictEqual(actual.getHeight(), expected.getHeight());
            for (let i = 0; i < actual.getHeight(); ++i) {
                for (let j = 0; j < actual.getWidth(); ++j) {
                    assert.strictEqual(actual.getAt(j, i), expected.getAt(j, i));
                }
            }
        });
    });

    describe('synchronous', () => {
        it('Calculates sync matrix', () => {
            const expected = (new Matrix([
                [19, 18, 7.5],
                [18, 18, 6],
                [7.5, 6, 10.5]
            ]));
            const actual = synchronous(new Matrix([
                [2, 2, 4],
                [3, 4, -1],
                [5, 4, 2]
            ]));
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
