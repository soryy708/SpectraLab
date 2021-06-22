import { strict as assert } from 'assert';
import { useSortedPair } from './rangeSelect';


describe('RangeSelect component', () => {
    const makeThrow = (..._params: any[]) => { throw new Error('');};
    const nop = (..._params: any[]) => {};
    const compareNumbers = (l: number, r: number) => l - r;

    describe('useSortedPair hook', () => {
        it('Doesn\'t mutate if pair is in order', () => {
            assert.doesNotThrow(() => {
                useSortedPair(2, 4, makeThrow, makeThrow, compareNumbers);
            });
        });

        it('Reorders if not in order', () => {
            const [aBefore, bBefore] = [4, 2];
            let [aAfter, bAfter] = [aBefore, bBefore];
            const changeA = (newVal: number) => { aAfter = newVal; };
            const changeB = (newVal: number) => { bAfter = newVal; };

            useSortedPair(aBefore, bBefore, changeA, changeB, compareNumbers);

            assert.strictEqual(aAfter, bBefore);
            assert.strictEqual(bAfter, aBefore);
        });

        it('Returns sorted if in order', () => {
            const [aBefore, bBefore] = [2, 4];

            const [aAfter, bAfter] = useSortedPair(aBefore, bBefore, makeThrow, makeThrow, compareNumbers);

            assert.strictEqual(aAfter, aBefore);
            assert.strictEqual(bAfter, bBefore);
        });

        it('Returns sorted if not in order', () => {
            const [aBefore, bBefore] = [4, 2];

            const [aAfter, bAfter] = useSortedPair(aBefore, bBefore, nop, nop, compareNumbers);

            assert.strictEqual(aAfter, bBefore);
            assert.strictEqual(bAfter, aBefore);
        });

        it('Changes just minimum if only it changes', () => {
            const [aBefore, bBefore] = [2, 4];
            let aAfter = aBefore;
            const changeA = (newVal: number) => { aAfter = newVal; };
            const newA = 1;

            const [, , onChangeA] = useSortedPair(aBefore, bBefore, changeA, makeThrow, compareNumbers);
            onChangeA(newA);
            
            assert.strictEqual(aAfter, newA);
        });

        it('Changes just maximum if only it changes', () => {
            const [aBefore, bBefore] = [2, 4];
            let bAfter = bBefore;
            const changeB = (newVal: number) => { bAfter = newVal; };
            const newB = 5;

            const [, , , onChangeB] = useSortedPair(aBefore, bBefore, makeThrow, changeB, compareNumbers);
            onChangeB(newB);
            
            assert.strictEqual(bAfter, newB);
        });

        it('Swaps if newA > b', () => {
            const [aBefore, bBefore] = [2, 4];
            let [aAfter, bAfter] = [aBefore, bBefore];
            const changeA = (newVal: number) => { aAfter = newVal; };
            const changeB = (newVal: number) => { bAfter = newVal; };
            const newA = 6;

            const [, , onChangeA] = useSortedPair(aBefore, bBefore, changeA, changeB, compareNumbers);
            onChangeA(newA);

            assert.strictEqual(aAfter, bBefore);
            assert.strictEqual(bAfter, newA);
        });

        it('Swaps if newB < a', () => {
            const [aBefore, bBefore] = [2, 4];
            let [aAfter, bAfter] = [aBefore, bBefore];
            const changeA = (newVal: number) => { aAfter = newVal; };
            const changeB = (newVal: number) => { bAfter = newVal; };
            const newB = 0;

            const [, , , onChangeB] = useSortedPair(aBefore, bBefore, changeA, changeB, compareNumbers);
            onChangeB(newB);

            assert.strictEqual(aAfter, newB);
            assert.strictEqual(bAfter, aBefore);
        });
    });
});
