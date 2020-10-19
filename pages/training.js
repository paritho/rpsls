import game from "../rpsls.js";

const { wire } = HyperHTMLElement,
  throws = ["rock", "paper", "scissors", "lizard", "spock"];
let count = 0,
  intervalId,
  numberOfThrowsInput,
  player1Placeholder = `
    <div class="player-placeholder d-flex justify-content-center align-items-center bg-primary">
      <span class="text-white">P1</span>
    </div>`,
  player2Placeholder = `
    <div class="player-placeholder d-flex justify-content-center align-items-center bg-primary">
      <span class="text-white">P2</span>
    </div>`,
  player1Select,
  player2Select,
  player1Viewport,
  player2Viewport,
  setNumberOfThrows,
  setPlayer1,
  setPlayer2,
  trainingBtn;

class Training extends HyperHTMLElement.Component {
  // Properties
  get contestants() {
    return this._contestants || {};
  }
  set contestants(contestants) {
    this._contestants = contestants;
    Object.assign(this.state.player1Options, contestants);
    Object.assign(this.state.player2Options, contestants);
    this.render();
  }
  // State Management
  get defaultState() {
    return {
      numberOfThrows: 5,
      player1: null,
      player1Options: {},
      player2: null,
      player2Options: {},
    };
  }
  _handleSetPlayer1(e) {
    const player1 = e.target.value;
    if (player1) {
      this.startIconCycle();
    } else {
      player1Viewport.innerHTML = player1Placeholder;
      if (!this.state.player2) {
        this.stopIconCycle();
      } else {
        this.startIconCycle();
      }
    }
    this.setState({ player1: e.target.value });
    trainingBtn.disabled = !this.state.player1 || !this.state.player2;
  }
  _handleSetPlayer2(e) {
    const player2 = e.target.value;
    if (player2) {
      this.startIconCycle();
    } else {
      player2Viewport.innerHTML = player2Placeholder;
      if (!this.state.player1) {
        this.stopIconCycle();
      } else {
        this.startIconCycle();
      }
    }
    this.setState({ player2: e.target.value });
    trainingBtn.disabled = !this.state.player1 || !this.state.player2;
  }
  _handleSetNumberOfThrows(e) {
    if (e.target.value < 1) {
      e.target.value = 1;
    } else if (e.target.value > 10000) {
      e.target.value = 10000;
    }
    this.setState({ numberOfThrows: e.target.value });
  }
  // Mount/Unmount
  onconnected() {
    numberOfThrowsInput = document.getElementById("number-of-throws-input");
    player1Select = document.getElementById("player1-roster");
    player2Select = document.getElementById("player2-roster");
    player1Viewport = document.getElementById("player1-viewport");
    player2Viewport = document.getElementById("player2-viewport");
    trainingBtn = document.getElementById("training-btn");
    setNumberOfThrows = this._handleSetNumberOfThrows.bind(this);
    setPlayer1 = this._handleSetPlayer1.bind(this);
    setPlayer2 = this._handleSetPlayer2.bind(this);
    numberOfThrowsInput.addEventListener("change", setNumberOfThrows);
    player1Select.addEventListener("input", setPlayer1);
    player2Select.addEventListener("input", setPlayer2);
  }
  ondisconnected() {
    numberOfThrowsInput.removeEventListener("change", setNumberOfThrows);
    player1Select.removeEventListener("input", setPlayer1);
    player2Select.removeEventListener("input", setPlayer2);
    this.stopIconCycle;
  }
  // Methods
  startIconCycle() {
    if (!intervalId) {
      intervalId = setInterval(() => {
        if (this.state.player1) {
          player1Viewport.innerHTML = this.contestants[
            this.state.player1
          ].paint(throws[count]);
        }
        if (this.state.player2) {
          player2Viewport.innerHTML = this.contestants[
            this.state.player2
          ].paint(throws[count]);
        }
        count++;
        count = count % 5;
      }, 250);
    }
  }
  startMatch() {
    // Pre-match setup
    trainingBtn.disabled = true;
    this.startIconCycle();
    for (let i = 0; i < this.state.numberOfThrows; i++) {
      const p1Throw = this.contestants[this.state.player1].play(),
        p2Throw = this.contestants[this.state.player2].play();
      // Log opponent Throw
      this.contestants[this.state.player1].lastOpThrow(p2Throw);
      this.contestants[this.state.player2].lastOpThrow(p1Throw);
    }
    // TODO - Delete console logs
    console.log(
      `Player 1 opponent throws: ${
        this.contestants[this.state.player1].opThrows
      }`
    );
    console.log(
      `Player 2 opponent throws: ${
        this.contestants[this.state.player2].opThrows
      }`
    );
    // Re-enable training button
    trainingBtn.disabled = false;
  }
  stopIconCycle() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
      count = 0;
    }
  }
  // Render
  render() {
    return this.html`
      <div class="row justify-content-center">
        <div class="col-6">
          <div class="row text-center"><div class="col"><h1 class="text-white">Rock Paper</h1></div></div>
          <div class="row text-center"><div class="col"><h1 class="text-white">Scissors Lizard</h1></div></div>
          <div class="row text-center"><div class="col"><h1 class="text-white">Spock</h1></div></div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-3">
          <div>
            <label for="player1-roster" class="d-block h3 text-white text-center">Roster: Player 1</label>
            <select id="player1-roster" class="w-100 rounded">
              <option value="">--Select a Contestant--</option>
              ${Object.keys(this.state.player1Options)
                .sort()
                .map((player) => {
                  return wire()`
                  <option value="${player}" selected="${
                    player === this.state.player1
                  }">${player.toUpperCase()}</option>`;
                })}
            </select>
          </div>
        </div>
        <div class="col-6 align-self-end d-flex justify-content-center">
          <div id="training-start-group" class="input-group">
            <input
              id="number-of-throws-input"
              class="form-control"
              type="number"
              placeholder="Number of Throws"
              min="1"
              max="10000"
              value="5"
            />
            <div class="input-group-append">
              <button
                id="training-btn"
                data-call="startMatch"
                onclick="${this}"
                type="button" 
                class="btn btn-primary"
                disabled
              >
                Throw!
              </button>
            </div>
          </div>
        </div>
        <div class="col-3">
          <div>
            <label for="player2-roster" class="d-block h3 text-white text-center">Roster: Player 2</label>
            <select id="player2-roster" class="w-100 rounded">
              <option value="">--Select a Contestant--</option>
              ${Object.keys(this.state.player2Options)
                .sort()
                .map((player) => {
                  return wire()`
                  <option value="${player}" selected="${
                    player === this.state.player2
                  }">${player.toUpperCase()}</option>`;
                })}
            </select>
          </div>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col-5 d-flex justify-content-end">
          <div id="player1-viewport">
            <div class="player-placeholder d-flex justify-content-center align-items-center bg-primary">
              <span class="text-white">P1</span>
            </div>
          </div>
        </div>
        <div onconnected="${this}" ondisconnected="${this}" id="vs-block" class="col-2 text-center align-self-end text-white">VS</div>
        <div class="col-5 d-flex justify-content-start">
          <div id="player2-viewport">
            <div class="player-placeholder d-flex justify-content-center align-items-center bg-primary">
              <span class="text-white">P2</span>
            </div>
          </div>
        </div>
      </div>`;
  }
}

export default Training;
