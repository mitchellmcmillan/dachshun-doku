import React from 'react';
import './App.css';
import dog_image from './sprites/dog-still.png';
import { Link } from 'react-router-dom';

function ButtonLink(props) {
  return props.disabled
    ?
    <div className="App-button App-button-disabled">
      {props.children}
    </div>
    :
    <Link to={props.to} style={{ textDecoration: 'none' }}>
      <div className="App-button App-button-enabled">
        {props.children}
      </div>
    </Link>;
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { difficulty: window.localStorage.getItem('difficulty') || 50 };
  }

  onDifficultyChanged(event) {
    let difficulty = event.target.value;
    this.setState({ difficulty: difficulty });
    window.localStorage.setItem('difficulty', difficulty);
  }

  render() {
    let currentId = window.localStorage.getItem('currentId');
    return (
      <div className="App">
        <header className="App-header">
          <img className="App-title-image" src={dog_image} alt="" />
          <h1>
            DACHSHUN-DOKU
          </h1>
          <section className="App-buttons">
            <ButtonLink to={`/game/${currentId}`} disabled={!currentId}>continue</ButtonLink>
            <ButtonLink to={`/new/${this.state.difficulty}`}>new sudoku</ButtonLink>

            <div>
              <input type="range" id="difficulty-slider" step="10" defaultValue={this.state.difficulty} onChange={this.onDifficultyChanged.bind(this)} />
              difficulty
            </div>

            <ButtonLink to="/unsolved">unsolved</ButtonLink>
          </section>
        </header>
      </div>
    );
  }
}

export default App;
