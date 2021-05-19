import React, { useState } from 'react';
import ReactDom from 'react-dom';
import GraphRoute from './page/graph';
import LoadRoute from './page/load';
import Matrix from '../matrix';

function App() {
    const [matrix, setMatrix] = useState<Matrix>(null);
    const [frequencies, setFrequencies] = useState<number[]>([]);
    
    if (matrix) {
        return <GraphRoute data={matrix} frequencies={frequencies}/>;
    }

    return <LoadRoute onLoad={(mat, freq) => {
        setMatrix(mat);
        setFrequencies(freq);
    }}/>;
}

ReactDom.render(<App/>, document.getElementById('root'));
