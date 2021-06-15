import React from 'react';

type SwitchProps = {
    label?: string;
    onValue: string;
    offValue: string;
    value: string;
    onChange: (newValue: string) => void;
};

const Switch: React.FunctionComponent<SwitchProps> = (props: SwitchProps) => {
    const value = props.value === props.onValue;
    return <div className={'toggle' + (value ? ' on' : ' off') + (props.label ? ' withLabel' : '')}>
        {props.label && <label className="label">{props.label}</label>}
        <div>
            <span>{props.offValue}</span>
            <button
                type="button"
                onClick={() => {
                    props.onChange(value ? props.offValue : props.onValue);
                }}
            >
            </button>
            <span>{props.onValue}</span>
        </div>
    </div>;
};

export default Switch;
