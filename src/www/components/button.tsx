import React from 'react';

type Props = {
    type?: 'button' | 'submit' | 'reset',
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    text: string,
    disabled?: boolean,
    primary?: boolean,
};

const Button: React.FunctionComponent<Props> = (props: Props) => {
    return <button
        className={`button ${props.primary ? 'primary': ''}`}
        // eslint-disable-next-line react/button-has-type
        type={props.type ? props.type : 'button'}
        onClick={props.onClick}
        disabled={props.disabled}
    >
        {props.text}
    </button>;
};

export default Button;
