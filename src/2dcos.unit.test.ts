import { strict as assert } from 'assert';
import Matrix from './matrix';
import { hilbertNodaTransformationMatrix } from './2dcos';

describe('2dcos', () => {
    describe('hilbertNodaTransformationMatrix', () => {
        it('Calculates case1 correctly', () => {
            const expected = (new Matrix([
                [0,       1, 1/2, 1/3],
                [-1,      0,   1, 1/2],
                [-1/2,   -1,   0,   1],
                [-1/3, -1/2,  -1,   0],
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
});
