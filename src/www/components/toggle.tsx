import React, { useState } from 'react';

type ToggleProps = {
    label?: string;
    value: boolean;
    onChange: (newValue: boolean) => void;
};

const Toggle: React.FunctionComponent<ToggleProps> = (props: ToggleProps) => {
    const [value, setValue] = useState(false);

    return <div className={'toggle' + (props.value ? ' on' : ' off') + (props.label ? ' withLabel' : '')}>
        {props.label && <label className="label">{props.label}</label>}
        <button
            type="button"
            onClick={() => {
                setValue(oldValue => !oldValue);
                props.onChange(!value);
            }}
        >
        </button>
    </div>;
};

export default Toggle;
