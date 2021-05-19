import React, { useEffect } from 'react';

type RangeSelectProps = {
    options: any[];
    minValue: any;
    maxValue: any;
    onChangeMin: (newVal: any) => void;
    onChangeMax: (newVal: any) => void;
    /**
     * If lval < rval, return less than 0
     * If lval > rval, return more than 0
     * Otherwise, return 0
     */
    compare: (lval: any, rval: any) => number;
};

const RangeSelect: React.FunctionComponent<RangeSelectProps> = (props: RangeSelectProps) => {
    function changeLeft(newValue: any) {
        if (props.compare(props.maxValue, newValue) > 0) { // newValue <= props.maxValue
            props.onChangeMin(newValue);
        } else {
            props.onChangeMin(props.maxValue);
            props.onChangeMax(newValue);
        }
    }

    function changeRight(newValue: any) {
        if (props.compare(newValue, props.minValue)) { // newValue >= props.minValue
            props.onChangeMax(newValue);
        } else {
            props.onChangeMax(props.minValue);
            props.onChangeMin(newValue);
        }
    }

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
            value={isNaN(props.minValue) ? '' : props.minValue}
            onChange={e => changeLeft(e.target.value)}
        >
            {props.options.map(option => (
                <option key={option}>{option}</option>
            ))}
        </select>
        <span>to</span>
        <select
            value={isNaN(props.maxValue) ? '' : props.maxValue}
            onChange={e => changeRight(e.target.value)}
        >
            {props.options.map(option => (
                <option key={option}>{option}</option>
            ))}
        </select>
    </div>;
};

export default RangeSelect;
