import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Game from './Game';
import UnsolvedList from './UnsolvedList';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";
import { TransitionGroup, CSSTransition } from 'react-transition-group';

function GameById(props) {
  let { id } = useParams();
  return <Game key={id} id={id} />
}

function NewGame(props) {
  let { difficulty } = useParams();
  return <Game difficulty={difficulty} />
}

ReactDOM.render(
  <Router>
    <Route render={location => {
      const { key } = location.location;
      return (
        <TransitionGroup component={null}>
          <CSSTransition key={key} classNames="fade" timeout={300}>
            <Switch>
              <Route path="/new/:difficulty">
                <NewGame />
              </Route>

              <Route path="/game/:id">
                <GameById />
              </Route>

              <Route path="/unsolved">
                <UnsolvedList />
              </Route>

              <Route exact path="/">
                <App />
              </Route>
            </Switch>
          </CSSTransition>
        </TransitionGroup>
      );
    }} />
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
