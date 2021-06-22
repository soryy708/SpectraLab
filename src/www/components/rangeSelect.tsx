import React, { useEffect } from 'react';

type RangeSelectProps<T> = {
    options: T[];
    minValue: T;
    maxValue: T;
    onChangeMin: (newVal: T) => void;
    onChangeMax: (newVal: T) => void;
    /**
     * If lval < rval, return less than 0
     * If lval > rval, return more than 0
     * Otherwise, return 0
     */
    compare: (lval: T, rval: T) => number;
};

export function useSortedPair<T>(a: T, b: T, onChangeA: (newA: T) => void, onChangeB: (newB: T) => void, compare: (lval: T, rval: T) => number): [T, T, (newVal: T) => void, (newVal: T) => void] {
    const min = compare(a, b) > 0 ? b : a;
    const max = compare(a, b) > 0 ? a : b;

    if (compare(a, b) > 0) { // a > b
        onChangeA(b);
        onChangeB(a);
    }

    const onChangeMin: (newVal: T) => void = newVal => {
        if (compare(newVal, max) > 0) { // newVal > max
            onChangeA(max);
            onChangeB(newVal);
        } else {
            onChangeA(newVal);
        }
    };
    const onChangeMax: (newVal: T) => void = newVal => {
        if (compare(newVal, min) < 0) { // newVal < min
            onChangeA(newVal);
            onChangeB(min);
        } else {
            onChangeB(newVal);
        }
    };
    return [min, max, onChangeMin, onChangeMax];
}

const RangeSelect: React.FunctionComponent<RangeSelectProps<any>> = (props: RangeSelectProps<any>) => {
    const [min, max, onChangeMin, onChangeMax] = useSortedPair<any>(props.minValue, props.maxValue, props.onChangeMin, props.onChangeMax, props.compare);

    useEffect(() => {
        if (props.options.length > 0 && isNaN(props.minValue)) {
            props.onChangeMin(props.options[0]);
        }
    }, [props.options, props.minValue]);

    useEffect(() => {
        if (props.options.length > 0 && isNaN(props.maxValue)) {
            props.onChangeMax(props.options[props.options.length - 1]);
        }
    }, [props.options, props.maxValue]);

    return <div className="rangeSelect">
        <select
            value={isNaN(min) ? '' : min}
            onChange={e => onChangeMin(e.target.value)}
        >
            {props.options.map(option => (
                <option key={option}>{option}</option>
            ))}
        </select>
        <span>to</span>
        <select
            value={isNaN(max) ? '' : max}
            onChange={e => onChangeMax(e.target.value)}
        >
            {props.options.map(option => (
                <option key={option}>{option}</option>
            ))}
        </select>
    </div>;
};

export default RangeSelect;
