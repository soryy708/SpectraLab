import React, { useEffect, useState } from 'react';
import Graph from '../components/graph';
import Button from '../components/button';
import Toggle from '../components/toggle';
import Matrix from '../../matrix';
import corspec from '../../2dcos';

type GraphPageProps = {
    data?: Matrix;
};

type CorspecType = 'Φ' | 'Ψ';

const GraphPage: React.FunctionComponent<GraphPageProps> = (props: GraphPageProps) => {
    const [showLocalExtremum, setShowLocalExtremum] = useState(false);
    const [showGlobalExtremum, setShowGlobalExtremum] = useState(false);
    const [showContours, setShowContours] = useState(false);
    const [corspecType, setCorspecType] = useState<CorspecType>('Φ');
    const [dataAsΦ, setDataAsΦ] = useState<Matrix>(new Matrix([[0]]));
    const [dataAsΨ, setDataAsΨ] = useState<Matrix>(new Matrix([[0]]));

    const data = (() => {
        switch (corspecType) {
            case 'Φ':
                return dataAsΦ;
            case 'Ψ':
                return dataAsΨ;
        }
    })();

    useEffect(() => {
        setDataAsΦ(corspec.synchronous(props.data));
        setDataAsΨ(corspec.asynchronous(props.data));
    }, [props.data]);

    return <div className="page graphPage">
        <div className="leftPart">
            <Button
                text="Φ"
                onClick={() => setCorspecType('Φ')}
            />
            <Button
                text="Ψ"
                onClick={() => setCorspecType('Ψ')}
            />

            <Toggle
                label="Show local extremum?"
                value={showLocalExtremum}
                onChange={(newVal) => setShowLocalExtremum(newVal)}
            />
            <Toggle
                label="Show global extremum?"
                value={showGlobalExtremum}
                onChange={(newVal) => setShowGlobalExtremum(newVal)}
            />
            <Toggle
                label="Show contours?"
                value={showContours}
                onChange={(newVal) => setShowContours(newVal)}
            />
        </div>
        <div className="rightPart">
            <Graph
                data={data}
                showLocalExtremum={showLocalExtremum}
                showGlobalExtremum={showGlobalExtremum}
                showContours={showContours}
            />
        </div>
    </div>;
};

export default GraphPage;
