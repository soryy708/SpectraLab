import React from 'react';
import Button from './button';

type Props = {
    type?: string,
    value?: string,
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    buttonType?: 'button' | 'submit' | 'reset',
    buttonText?: string,
};

const ButtonedInput: React.FunctionComponent<Props> = (props: Props) => {
    const {type, value, onChange, onClick, buttonType, buttonText} = props;
    return <div className="buttonedInput">
        <input className="input" type={type} value={value} onChange={onChange}/>
        <Button type={buttonType} onClick={onClick} text={buttonText}/>
    </div>;
};

export default ButtonedInput;
