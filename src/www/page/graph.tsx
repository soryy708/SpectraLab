import React, { useState } from 'react';
import Graph from '../components/graph';
import Toggle from '../components/toggle';
import Matrix from '../../matrix';

type GraphPageProps = {
    data?: Matrix;
};

const GraphPage: React.FunctionComponent<GraphPageProps> = (props: GraphPageProps) => {
    const [showLocalExtremum, setShowLocalExtremum] = useState(false);
    const [showGlobalExtremum, setShowGlobalExtremum] = useState(false);

    return <div className="page graphPage">
        <div className="leftPart">
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
        </div>
        <div className="rightPart">
            <Graph
                data={props.data}
                showLocalExtremum={showLocalExtremum}
                showGlobalExtremum={showGlobalExtremum}
            />
        </div>
    </div>;
};

export default GraphPage;
