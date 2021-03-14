import React, { useState } from 'react';
import ReactDom from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import GraphRoute from './page/graph';
import LoadRoute from './page/load';
import Matrix from '../matrix';

function App() {
    const [matrix/*, setMatrix*/] = useState<Matrix>();

    return <HashRouter>
        <Switch>
            <Route exact path="/" component={LoadRoute}/>
            <Route path="/graph" component={() => <GraphRoute data={matrix}/>}/>
        </Switch>
    </HashRouter>;
}

ReactDom.render(<App/>, document.getElementById('root'));
