import React, { useState } from 'react';
import ReactDom from 'react-dom';
import GraphRoute from './page/graph';
import LoadRoute from './page/load';
import Matrix from '../matrix';

function App() {
    const [matrix, setMatrix] = useState<Matrix>(null);
    
    if (matrix) {
        return <GraphRoute data={matrix}/>;
    }

    return <LoadRoute onLoad={(mat) => {
        setMatrix(mat);
    }}/>;
}

ReactDom.render(<App/>, document.getElementById('root'));
