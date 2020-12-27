import React from 'react';
import ReactDom from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import LoadRoute from './page/load';

function App() {
    return <HashRouter>
        <Switch>
            <Route exact path="/" component={LoadRoute}/>
        </Switch>
    </HashRouter>;
}

ReactDom.render(<App/>, document.getElementById('root'));
