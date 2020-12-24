import React from 'react';
import ReactDom from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import HomeRoute from './page/home';

function App() {
    return <HashRouter>
        <Switch>
            <Route exact path="/" component={HomeRoute}/>
        </Switch>
    </HashRouter>;
}

ReactDom.render(<App/>, document.getElementById('root'));
