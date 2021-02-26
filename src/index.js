import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
let ruta = "http://localhost:4884";
ReactDOM.render(
    <React.StrictMode >
        <Router >
            <Switch >
                <Route path="/" >
                </Route>
            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);