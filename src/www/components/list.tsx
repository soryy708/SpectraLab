import React from 'react';

type Props = {
    label?: string;
    values: any[];
    onRenderItem: (val: any, i: number) => React.ReactElement;
    onValueHover?: (val: any) => void;
    onValueHoverOut?: () => void;
};

const List: React.FunctionComponent<Props> = (props: Props) => {
    return <div className="list">
        {props.label && <label>{props.label}</label>}
        <div className="body"
            onMouseOut={() => { if (props.onValueHoverOut) { props.onValueHoverOut(); } }}
        >
            {props.values.map((val, i) => <span
                key={i}
                className="item"
                onMouseOver={() => { if (props.onValueHover) { props.onValueHover(val); } }}
            >
                {props.onRenderItem(val, i)}
            </span>)}
        </div>
    </div>;
};

export default List;
