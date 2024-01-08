import React from 'react';
import './App.css';
import { isComplete } from './sudoku';
import db from './db';
import LittleDog from './LittleDog';
import { withRouter } from "react-router-dom";
import DogController from './DogController';
import deepCopy from './deep-copy';
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!./worker.js';

export class Cell extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.numberRef = React.createRef();
  }

  componentDidMount() {
    let rect = this.numberRef.current.getBoundingClientRect();
    DogController.addLevel(rect.y + rect.height);
  }

  onClick() {
    this.props.cb({ row: this.props.row, column: this.props.column, position: this.numberRef.current.getBoundingClientRect() });
  }

  render() {
    return (
      <td
        onClick={this.onClick}
        className={this.props.active ? "active" : null}
        ref={this.numberRef}>
        <span className={"App-square-top-left"}>{this.props.cell.noteTopLeft}</span>
        <span className={"App-square-bottom-left"}>{this.props.cell.noteBottomLeft}</span>
        <span>{this.props.cell.value}</span>
        <span className={"App-square-top-right"}>{this.props.cell.noteTopRight}</span>
        <span className={"App-square-bottom-right"}>{this.props.cell.noteBottomRight}</span>
      </td>
    );
  }
}

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: false };
    this.onClick = this.onClick.bind(this);
    this.numberRef = React.createRef();
  }

  componentDidMount() {
    let rect = this.numberRef.current.getBoundingClientRect();
    DogController.addLevel(rect.y + rect.height);
  }

  onClick() {
    this.setState({ active: true })
    this.props.cb(this.numberRef.current.getBoundingClientRect());
    setTimeout(() => {
      this.setState({ active: false });
    }, 500);
  }

  render() {
    return (
      <td onClick={this.onClick} className={this.state.active ? "active" : null} ref={this.numberRef}>{this.props.children}</td>
    )
  }
}

function InputButton(props) {
  return <Button cb={(position) => props.cb({ value: props.value, position })}>{props.children}</Button>
}

const emptyGrid = [...Array(9)].map(e => Array(9).fill({ predefined: true, value: null }));
const exampleStates = ["App-example-main", "App-example-top-right", "App-example-top-left"];
class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: null,
      complete: false,
      selected: null,
      latestInput: null,
      resetTimer: null,
      exampleState: 0,
    };
    this.history = [];

    this.middleRef = React.createRef();

    this.onSelect = this.onSelect.bind(this);
    this.onInput = this.onInput.bind(this);
    this.undo = this.undo.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.nextExampleState = this.nextExampleState.bind(this);
    this.onGeneratedGame = this.onGeneratedGame.bind(this)
  }

  componentDidMount() {
    let rect = this.middleRef.current.getBoundingClientRect();
    DogController.addLevel(rect.y + rect.height);

    if (this.props.id) {
      this.id = parseInt(this.props.id, 10);
      this.getGridById(this.id);
    } else if (this.props.difficulty) {
      function mapRange(value, sourceLow, sourceHigh, targetLow, targetHigh) {
        return Math.min(targetHigh, Math.max(targetLow, Math.round(value / (sourceHigh - sourceLow) * (targetHigh - targetLow)) + targetLow));
      }
      this.worker = new Worker();
      this.worker.addEventListener('message', this.onGeneratedGame);
      let difficulty = parseInt(this.props.match.params.difficulty, 10);
      let mappedDifficulty = mapRange(difficulty, 0, 100, 40, 75);
      this.worker.postMessage(mappedDifficulty);
    }

    document.addEventListener('keypress', this.onKeyPress);
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this.onKeyPress);
    document.removeEventListener('keydown', this.onKeyDown);
    this.worker && this.worker.removeEventListener('message', this.onGeneratedGame);
  }

  onGeneratedGame(e) {
    db.table('unsolved')
      .add({ date: new Date(), grid: e.data })
      .then(id => {
        this.id = id;
        // why are 2 games generated instead of 1...
        setTimeout(() => {
          db.table("unsolved").reverse().toArray().then(entries => {
            if (entries[0].id === id && entries.length > 1) {
              db.table("unsolved").delete(id);
              window.localStorage.setItem('currentId', entries[1].id);
            }
          });
        }, 500);
        this.getGridById(id);
      });
  }

  getGridById(id) {
    db.table('unsolved')
      .get(id, entry => {
        if (entry) {
          window.localStorage.setItem('currentId', entry.id);
          this.setState({ grid: entry.grid });
        } else {
          this.props.history.push("/");
        }
      });
  }

  onSelect(position) {
    this.setState({ selected: position });
  }

  onKeyPress(event) {
    if ("0123456789".includes(event.key)) {
      this.onInput(parseInt(event.key, 10));
    }
    event.preventDefault();
  }

  onKeyDown(event) {
    switch (event.key) {
      case "ArrowRight":
        this.setState((prevState, props) => ({
          selected: {
            row: prevState.selected ? prevState.selected.row : 0,
            column: Math.min((prevState.selected ? prevState.selected.column : -1) + 1, 8)
          }
        }));
        break;
      case "ArrowLeft":
        this.setState((prevState, props) => ({
          selected: {
            row: prevState.selected ? prevState.selected.row : 0,
            column: Math.max((prevState.selected ? prevState.selected.column : 9) - 1, 0)
          }
        }));
        break;
      case "ArrowDown":
        this.setState((prevState, props) => ({
          selected: {
            row: Math.min((prevState.selected ? prevState.selected.row : -1) + 1, 8),
            column: prevState.selected ? prevState.selected.column : 0
          }
        }));
        break;
      case "ArrowUp":
        this.setState((prevState, props) => ({
          selected: {
            row: Math.max((prevState.selected ? prevState.selected.row : 9) - 1, 0),
            column: prevState.selected ? prevState.selected.column : 0
          }
        }));
        break;
      case " ":
        this.nextExampleState();
        break;
      default:
    }
  }

  onInput(data) {
    let { value, position } = data;
    if (this.state.selected) {
      if (value && !this.state.grid[this.state.selected.row][this.state.selected.column].predefined) {
        this.setState({ latestInput: { value, time: new Date() } });
        if (this.state.resetTimer) {
          clearTimeout(this.state.resetTimer);
        }
        this.setState({ resetTimer: setTimeout(() => this.setState({ latestInput: null }), 2000) });
      }

      this.update(value, this.state.selected, true, position, this.state.selected.position);
    }
  }

  update(value, position, recordHistory, startCoords, endCoords) {
    let cell = this.state.grid[position.row][position.column];
    if (!cell.predefined) {
      if (recordHistory) {
        this.history.push({
          position, value: cell.value,
          noteTopLeft: cell.noteTopLeft || null,
          noteTopRight: cell.noteTopRight || null,
          noteBottomLeft: cell.noteBottomLeft || null,
          noteBottomRight: cell.noteBottomRight || null
        });
      }

      let grid = deepCopy(this.state.grid);

      switch (exampleStates[this.state.exampleState]) {
        case "App-example-main":
          grid[position.row][position.column].value = value;
          break;
        case "App-example-top-right":
          grid[position.row][position.column].noteTopRight = value;
          break;
        case "App-example-top-left":
          grid[position.row][position.column].noteTopLeft = value;
          break;
        case "App-example-bottom-right":
          grid[position.row][position.column].noteBottomRight = value;
          break;
        case "App-example-bottom-left":
          grid[position.row][position.column].noteBottomLeft = value;
          break;
        default:
      }

      db.table('unsolved').update(this.row_idx, { grid: grid });

      let is_complete = isComplete(grid);
      if (is_complete) {
        window.localStorage.removeItem("currentId");
        db.table('unsolved').delete(this.id);
        DogController.addDog(startCoords, value, endCoords,
          () => this.setState({ grid: grid, complete: is_complete }));
      } else {
        this.setState({ grid: grid, complete: is_complete })
      }
    }
  }

  undo() {
    if (this.history.length > 0) {
      let { position, value } = this.history.pop();
      this.update(value, position, false);
    }
  }

  nextExampleState() {
    this.setState((prevState, props) => ({ exampleState: prevState.exampleState + 1 === exampleStates.length ? 0 : prevState.exampleState + 1 }));
  }

  render() {
    return (
      <div className="App">
        <div className="App-title-bar">
          <h1 className="App-navigation-button" onClick={() => window.history.back()}>&lt;</h1>
          <h1>DACHSHUN-DOKU</h1>

          <h1 className="App-navigation-button"> </h1>
        </div>
        <div className="App-body">
          <table>
            <tbody>
              {(this.state.grid || emptyGrid).map((row, row_idx) =>
                <tr key={row_idx}>
                  {row.map((cell, col_idx) => (
                    <Cell
                      key={(row_idx + 1) * 10 + col_idx}
                      cell={cell}
                      row={row_idx}
                      column={col_idx}
                      cb={this.onSelect}
                      active={this.state.selected
                        ? (this.state.selected.row === row_idx || this.state.selected.column === col_idx)
                        : false} />
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="App-title-bar App-middle" ref={this.middleRef}>
          {this.state.latestInput && this.state.latestInput.value &&
            [...Array(this.state.latestInput.value)].map((e, i) => <LittleDog key={this.state.latestInput.time.getTime() + i} />)}
        </div>
        <div className="App-controls-container">
          <table className="App-controls">
            <tbody>
              <tr>
                <InputButton value={1} cb={this.onInput}>1</InputButton>
                <InputButton value={2} cb={this.onInput}>2</InputButton>
                <InputButton value={3} cb={this.onInput}>3</InputButton>
              </tr>
              <tr>
                <InputButton value={4} cb={this.onInput}>4</InputButton>
                <InputButton value={5} cb={this.onInput}>5</InputButton>
                <InputButton value={6} cb={this.onInput}>6</InputButton>
              </tr>
              <tr>
                <InputButton value={7} cb={this.onInput}>7</InputButton>
                <InputButton value={8} cb={this.onInput}>8</InputButton>
                <InputButton value={9} cb={this.onInput}>9</InputButton>
              </tr>
              <tr>
                <td>
                  <div className="App-example-square" onClick={this.nextExampleState} style={{ display: "none" }}>
                    Blocking this for now
                    <span className={exampleStates[this.state.exampleState]}>#</span>
                  </div>
                </td>
                <InputButton value={null} cb={this.onInput}>X</InputButton>
                <Button cb={this.undo}>&lt;</Button>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default withRouter(Game);