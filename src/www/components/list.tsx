import React from 'react';

type Props = {
    label?: string;
    values: any[];
    onRenderItem: (val: any, i: number) => React.ReactElement;
};

const List: React.FunctionComponent<Props> = (props: Props) => {
    return <div className="list">
        {props.label && <label>{props.label}</label>}
        <div className="body">
            {props.values.map((val, i) => <span key={i} className="item">
                {props.onRenderItem(val, i)}
            </span>)}
        </div>
    </div>;
};

export default List;
