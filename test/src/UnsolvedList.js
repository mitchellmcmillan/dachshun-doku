import React from "react";
import { Cell } from "./Game";
import db from "./db";
import { withRouter } from 'react-router-dom';

class UnsolvedEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { deleted: false };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({ deleted: true });
    setTimeout(() => this.props.onDelete(this.props.entry.id), 300);
  }

  render() {
    return (
      <div className={this.state.deleted ? "App-unsolved-entry-deleted" : null}>
        <span className="App-unsolved-delete" onClick={() => this.onClick()}>X</span>
        <table onClick={() => this.props.history.push(`/game/${this.props.entry.id}`)}>
          <tbody>
            {this.props.entry.grid.map((row, row_idx) =>
              <tr key={row_idx}>
                {row.map((cell, col_idx) => (
                  <Cell
                    key={(row_idx + 1) * 10 + col_idx}
                    cell={cell}
                    row={row_idx}
                    column={col_idx}
                    cb={() => { }}
                  />
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

UnsolvedEntry = withRouter(UnsolvedEntry);

class UnsolvedList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { entries: null }
    this.delete = this.delete.bind(this);
  }

  componentDidMount() {
    this.updateUnsolved();
  }

  updateUnsolved() {
    db.table("unsolved").reverse().toArray().then(entries => this.setState({ entries }))
  }

  delete(id) {
    if (parseInt(window.localStorage.getItem("currentId"), 10) === id) {
      window.localStorage.removeItem("currentId");
    }
    db.table("unsolved").delete(id).then(e => this.updateUnsolved());
  }

  render() {
    return (
      <div className="App">
        <div className="App-title-bar">
          <h1 className="App-navigation-button" onClick={() => window.history.back()}>&lt;</h1>
          <h1>UNSOLVED</h1>
          <h1 className="App-navigation-button"> </h1>
        </div>
        <div className="App-body App-body-unsolved">
          {this.state.entries && this.state.entries.map(entry => <UnsolvedEntry key={entry.id} entry={entry} onDelete={this.delete} />)}
        </div>
      </div>
    );
  }
}

export default withRouter(UnsolvedList);