import game from "../rpsls.js";

const { wire } = HyperHTMLElement,
  throws = ["rock", "paper", "scissors", "lizard", "spock"],
  // Match Logic kept here for ease of painting html to the page,
  // can be moved later after some problems are resolved
  matchTypes = {
    bestOf(singleBout) {
      const numberOfMatches = this.state.matchOptions.bestOf,
        player1 = this.contestants[this.state.player1],
        player2 = this.contestants[this.state.player2];
      for (let matchCount = 0; matchCount < numberOfMatches; matchCount++) {
        singleBout();
      }
      if (player1.wins > player2.wins) {
        const p1Result = player1.iWon();
        player1.wins--;
        const p2Result = player2.iLost();
        player2.losses--;
        return { p1Result, p2Result };
      }
      if (player1.wins < player2.wins) {
        const p1Result = player1.iLost();
        player1.losses--;
        const p2Result = player2.iWon();
        player2.wins--;
        return { p1Result, p2Result };
      }
      let result;
      while (player1.wins === player2.wins) {
        result = singleBout();
      }
      return result;
    },
    firstTo(singleBout) {
      const matchesToWin = this.state.matchOptions.firstTo,
        player1 = this.contestants[this.state.player1],
        player2 = this.contestants[this.state.player2];
      let matchOver = false;
      while (!matchOver) {
        const result = singleBout();
        if (player1.wins === matchesToWin || player2.wins === matchesToWin) {
          matchOver = true;
          return result;
        }
      }
    },
    percentage(singleBout) {
      const percentageToWin = this.state.matchOptions.percentage
          .percentageToWin,
        minMatches = this.state.matchOptions.percentage.minMatches,
        maxMatches = this.state.matchOptions.percentage.maxMatches,
        player1 = this.contestants[this.state.player1],
        player1Wins = () => {
          const p1Result = player1.iWon();
          player1.wins--;
          const p2Result = player2.iLost();
          player2.losses--;
          matchOver = true;
          return { p1Result, p2Result };
        },
        player2 = this.contestants[this.state.player2],
        player2Wins = () => {
          const p1Result = player1.iLost();
          player1.losses--;
          const p2Result = player2.iWon();
          player2.wins--;
          matchOver = true;
          return { p1Result, p2Result };
        };
      let matchCount = 1,
        matchOver = false,
        result;
      for (; matchCount < minMatches; matchCount++) {
        singleBout();
      }
      while (!matchOver) {
        singleBout();
        matchCount++;
        if ((player1.wins / matchCount) * 100 >= percentageToWin) {
          result = player1Wins();
          continue;
        }
        if ((player2.wins / matchCount) * 100 >= percentageToWin) {
          result = player2Wins();
          continue;
        }
        if (matchCount === maxMatches) {
          if (player1.wins > player2.wins) {
            result = player1Wins();
            continue;
          }
          if (player1.wins < player2.wins) {
            result = player2Wins();
            continue;
          }
          while (player1.wins === player2.wins) {
            result = singleBout();
          }
          matchOver = true;
        }
      }
      return result;
    },
    singleBout() {
      // Here's where the fun begins
      const player1 = this.contestants[this.state.player1],
        player2 = this.contestants[this.state.player2],
        p1Throw = player1.play(),
        p2Throw = player2.play();
      // Log opponent Throw
      player1.lastOpThrow(p2Throw);
      player2.lastOpThrow(p1Throw);
      // Display Throws
      this.stopIconCycle();
      player1Viewport.innerHTML = player1.paint(p1Throw);
      player2Viewport.innerHTML = player2.paint(p2Throw);
      this.render();
      // Evaluate Throws
      let result = game.evaluate(p1Throw, p2Throw);
      if (result.iDraw) {
        return { p1Result: result.iDraw, p2Result: result.iDraw };
      }
      return {
        p1Result: player1[result.p1Result](),
        p2Result: player2[result.p2Result](),
      };
    },
  };
let iconCycleCount = 0,
  intervalId,
  matchStartBtn,
  matchCountInput,
  matchPercentInput,
  matchMinInput,
  matchMaxInput,
  matchTypeSelect,
  player1Msg,
  player2Msg,
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
  setMatchCount,
  setMatchType,
  setMatchMax,
  setMatchMin,
  setMatchPercent,
  setPlayer1,
  setPlayer2,
  viewportContainers,
  vsBlock;

class Home extends HyperHTMLElement.Component {
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
      matchBtnText: "Throw!",
      matchOptions: {
        bestOf: 5000,
        firstTo: 1000,
        matchType: "singleBout",
        percentage: {
          percentageToWin: 75,
          minMatches: 1000,
          maxMatches: 5000,
        },
      },
      player1: null,
      player1Options: {},
      player2: null,
      player2Options: {},
    };
  }
  _handleMaxMin(e) {
    const max = Number.parseInt(e.target.max, 10),
      min = Number.parseInt(e.target.min, 10);
    let value = Number.parseInt(e.target.value, 10);
    if (value > max) {
      return max;
    }
    if (value < min) {
      return min;
    }
    return value;
  }
  _handleSetMatchCount(e) {
    this.setState((oldState) => {
      const value = this._handleMaxMin(e);
      if (oldState.matchOptions.matchType === "bestOf") {
        oldState.matchOptions.bestOf = value;
      } else if (oldState.matchOptions.matchType === "firstTo") {
        oldState.matchOptions.firstTo = value;
      }
      return { matchOptions: oldState.matchOptions };
    });
  }
  _handleSetMatchType(e) {
    this.setState((oldState) => {
      oldState.matchOptions.matchType = e.target.value;
      return { matchOptions: oldState.matchOptions };
    });
  }
  _handleSetMatchMax(e) {
    this.setState((oldState) => {
      const value = this._handleMaxMin(e);
      oldState.matchOptions.percentage.maxMatches = value;
      return { matchOptions: oldState.matchOptions };
    });
  }
  _handleSetMatchMin(e) {
    this.setState((oldState) => {
      const value = this._handleMaxMin(e);
      oldState.matchOptions.percentage.minMatches = value;
      return { matchOptions: oldState.matchOptions };
    });
  }
  _handleSetMatchPercent(e) {
    this.setState((oldState) => {
      const value = this._handleMaxMin(e);
      oldState.matchOptions.percentage.percentageToWin = value;
      return { matchOptions: oldState.matchOptions };
    });
  }
  _handleSetPlayer1(e) {
    const player1 = e.target.value;
    Object.assign(this.state.player2Options, this.contestants);
    if (player1) {
      delete this.state.player2Options[player1];
      this.startIconCycle();
    } else {
      player1Viewport.innerHTML = player1Placeholder;
      if (!this.state.player2) {
        this.stopIconCycle();
      } else {
        this.startIconCycle();
      }
    }
    this.resetContestantWinsLosses();
    this.setState({ player1 });
    this.hidePlayerMessages();
    if (this.state.matchBtnText !== "Throw!") {
      setTimeout(() => {
        this.setState({ matchBtnText: "Throw!" });
      }, 300);
    }
  }
  _handleSetPlayer2(e) {
    const player2 = e.target.value;
    Object.assign(this.state.player1Options, this.contestants);
    if (player2) {
      delete this.state.player1Options[player2];
      this.startIconCycle();
    } else {
      player2Viewport.innerHTML = player2Placeholder;
      if (!this.state.player1) {
        this.stopIconCycle();
      } else {
        this.startIconCycle();
      }
    }
    this.resetContestantWinsLosses();
    this.setState({ player2 });
    this.hidePlayerMessages();
    if (this.state.matchBtnText !== "Throw!") {
      setTimeout(() => {
        this.setState({ matchBtnText: "Throw!" });
      }, 300);
    }
  }
  // Mount/Unmount
  onconnected() {
    // Get Elements
    matchCountInput = document.getElementById("match-count");
    matchMaxInput = document.getElementById("match-max");
    matchMinInput = document.getElementById("match-min");
    matchPercentInput = document.getElementById("match-percent");
    matchStartBtn = document.getElementById("match-start-btn");
    matchTypeSelect = document.getElementById("match-type");
    player1Msg = document.getElementById("player1-message");
    player1Select = document.getElementById("player1-roster");
    player1Viewport = document.getElementById("player1-viewport");
    player2Msg = document.getElementById("player2-message");
    player2Select = document.getElementById("player2-roster");
    player2Viewport = document.getElementById("player2-viewport");
    viewportContainers = document.querySelectorAll(".viewport-container");
    vsBlock = document.getElementById("vs-block");
    // Bind Methods
    setMatchCount = this._handleSetMatchCount.bind(this);
    setMatchType = this._handleSetMatchType.bind(this);
    setMatchMax = this._handleSetMatchMax.bind(this);
    setMatchMin = this._handleSetMatchMin.bind(this);
    setMatchPercent = this._handleSetMatchPercent.bind(this);
    setPlayer1 = this._handleSetPlayer1.bind(this);
    setPlayer2 = this._handleSetPlayer2.bind(this);
    // Add Event Listeners
    matchCountInput.addEventListener("change", setMatchCount);
    matchMaxInput.addEventListener("change", setMatchMax);
    matchMinInput.addEventListener("change", setMatchMin);
    matchPercentInput.addEventListener("change", setMatchPercent);
    matchTypeSelect.addEventListener("change", setMatchType);
    player1Select.addEventListener("change", setPlayer1);
    player2Select.addEventListener("change", setPlayer2);
  }
  ondisconnected() {
    matchCountInput.removeEventListener("change", setMatchCount);
    matchMaxInput.removeEventListener("change", setMatchMax);
    matchMinInput.removeEventListener("change", setMatchMin);
    matchPercentInput.removeEventListener("change", setMatchPercent);
    matchTypeSelect.removeEventListener("change", setMatchType);
    player1Select.removeEventListener("change", setPlayer1);
    player2Select.removeEventListener("change", setPlayer2);
    this.stopIconCycle;
  }
  // Methods
  displayPlayerMessages(p1Result, p2Result) {
    viewportContainers.forEach((el) => el.classList.add("shifted"));
    vsBlock.classList.add("invisible");
    if (this.state.matchOptions.matchType === "singleBout") {
      player1Msg.innerHTML = p1Result;
      player2Msg.innerHTML = p2Result;
      [player1Msg, player2Msg].forEach((el) =>
        el.classList.remove("collapsed")
      );
      setTimeout(() => {
        window.scrollTo({
          left: window.scrollX,
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 350);
      return;
    }
    player1Viewport.innerHTML = p1Result;
    player2Viewport.innerHTML = p2Result;
  }
  hidePlayerMessages() {
    viewportContainers.forEach((el) => el.classList.remove("shifted"));
    vsBlock.classList.remove("invisible");
    [player1Msg, player2Msg].forEach((el) => el.classList.add("collapsed"));
  }
  resetContestantWinsLosses() {
    if (this.state.player1) {
      const player1 = this.contestants[this.state.player1];
      player1.wins = 0;
      player1.losses = 0;
    }
    if (this.state.player2) {
      const player2 = this.contestants[this.state.player2];
      player2.wins = 0;
      player2.losses = 0;
    }
  }
  startIconCycle() {
    if (!intervalId) {
      intervalId = setInterval(() => {
        if (this.state.player1) {
          player1Viewport.innerHTML = this.contestants[
            this.state.player1
          ].paint(throws[iconCycleCount]);
        }
        if (this.state.player2) {
          player2Viewport.innerHTML = this.contestants[
            this.state.player2
          ].paint(throws[iconCycleCount]);
        }
        iconCycleCount++;
        iconCycleCount = iconCycleCount % 5;
      }, 250);
    }
  }
  startMatch() {
    // Pre-match setup
    matchStartBtn.disabled = true;
    this.hidePlayerMessages();
    this.startIconCycle();
    if (this.state.matchOptions.matchType !== "singleBout") {
      this.resetContestantWinsLosses();
    }
    // Begin countdown...
    this.setState({ matchBtnText: "1..." });
    setTimeout(() => {
      this.setState({ matchBtnText: "1, 2..." });
      setTimeout(() => {
        this.setState({ matchBtnText: "1, 2, 3!" });
        document
          .getElementById("match-start-spinner")
          .classList.remove("invisible");
        setTimeout(() => {
          let result;
          if (this.state.matchOptions.matchType === "bestOf") {
            result = matchTypes.bestOf.call(
              this,
              matchTypes.singleBout.bind(this)
            );
          } else if (this.state.matchOptions.matchType === "firstTo") {
            result = matchTypes.firstTo.call(
              this,
              matchTypes.singleBout.bind(this)
            );
          } else if (this.state.matchOptions.matchType === "percentage") {
            result = matchTypes.percentage.call(
              this,
              matchTypes.singleBout.bind(this)
            );
          } else {
            result = matchTypes.singleBout.call(this);
          }
          if (typeof result instanceof Error) {
            alert(result);
          } else {
            this.displayPlayerMessages(result.p1Result, result.p2Result);
          }
          this.render();
          document
            .getElementById("match-start-spinner")
            .classList.add("invisible");
          // Re-enable match button
          setTimeout(() => {
            matchStartBtn.disabled = false;
            this.setState({ matchBtnText: "Rematch?" });
          }, 1000);
        }, 100);
      }, 1000);
    }, 1000);
  }
  stopIconCycle() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
      iconCycleCount = 0;
    }
  }
  // Render
  render() {
    return this.html`
        <!-- Match Options Modal -->
        <div>
          <div>
            <div class="modal fade" id="matchOptionsModal" tabindex="-1" role="dialog" aria-labelledby="matchOptionsModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="matchOptionsModalLabel">Match Options</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label for="match-type" class="d-block h5">Match Type</label>
                      <select id="match-type" class="custom-select match-options-form">
                        <option value="singleBout">Single Bout</option>
                        <option value="bestOf">Best of Match Count</option>
                        <option value="firstTo">First to Match Count</option>
                        <option value="percentage">First to Percentage</option>
                      </select>
                    </div>
                    <div class="mb-3 modal-form-item ${
                      this.state.matchOptions.matchType === "bestOf" ||
                      this.state.matchOptions.matchType === "firstTo"
                        ? "visible"
                        : "invisible"
                    }">
                      <label for="match-count" class="d-block h5">Match Count</label>
                      <input
                        id="match-count"
                        type="number"
                        min="1"
                        max="5000"
                        value="${
                          this.state.matchOptions.matchType === "bestOf"
                            ? this.state.matchOptions.bestOf
                            : this.state.matchOptions.firstTo
                        }"
                        class="form-control match-options-form"
                      />
                    </div>
                    <div class="mb-3 modal-form-item row ${
                      this.state.matchOptions.matchType === "percentage"
                        ? "visible"
                        : "invisible"
                    }">
                      <div class="col-4">
                        <label for="match-percent" class="d-block h5">Percentage</label>
                        <input
                          id="match-percent"
                          type="number"
                          min="50"
                          max="100"
                          value="${
                            this.state.matchOptions.percentage.percentageToWin
                          }"
                          class="form-control match-options-form"
                        />
                      </div>
                      <div class="col-4">
                        <label for="match-min" class="d-block h5">Min Matches</label>
                        <input
                          id="match-min"
                          type="number"
                          min="10"
                          max="5000"
                          value="${
                            this.state.matchOptions.percentage.minMatches
                          }"
                          class="form-control match-options-form"
                        />
                      </div>
                      <div class="col-4">
                        <label for="match-max" class="d-block h5">Max Matches</label>
                        <input
                          id="match-max"
                          type="number"
                          min="10"
                          max="5000"
                          value="${
                            this.state.matchOptions.percentage.maxMatches
                          }"
                          class="form-control match-options-form"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Scores & Title -->
        <div class="row">
          <div class="col-3 player-scores ${
            this.state.player1 ? "visible" : "invisible"
          }">
            <h3 class="text-white">PLAYER 1</h3>
            <h5 class="text-white">WINS: ${
              this.contestants[this.state.player1]?.wins
            }</h5>
            <h5 class="text-white">LOSSES: ${
              this.contestants[this.state.player1]?.losses
            }</h5>
          </div>
          <div class="col-6">
            <div class="row text-center"><div class="col"><h1 class="text-white">Rock Paper</h1></div></div>
            <div class="row text-center"><div class="col"><h1 class="text-white">Scissors Lizard</h1></div></div>
            <div class="row text-center"><div class="col"><h1 class="text-white">Spock</h1></div></div>
          </div>
          <div class="col-3 player-scores text-right ${
            this.state.player2 ? "visible" : "invisible"
          }">
            <h3 class="text-white">PLAYER 2</h3>
            <h5 class="text-white">WINS: ${
              this.contestants[this.state.player2]?.wins
            }</h5>
            <h5 class="text-white">LOSSES: ${
              this.contestants[this.state.player2]?.losses
            }</h5>
          </div>
        </div>
        <!-- Rosters and Form  -->
        <div id="roster-form-row" class="row mt-4 align-items-end">
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
          <div class="col-6 d-flex justify-content-center">
            <div id="match-group" class="d-flex justify-content-center align-items-end ${
              this.state.player1 && this.state.player2 ? "visible" : "invisible"
            }">
              <button
                id="match-options-btn"
                type="button"
                class="btn btn-light"
                data-toggle="modal"
                data-target="#matchOptionsModal"
              >
                Match Options
                <i data-feather="settings"></i>
              </button>
              <button
                id="match-start-btn"
                data-call="startMatch"
                onclick="${this}"
                type="button" 
                class="btn btn-light"
              >
                ${this.state.matchBtnText}
                <!-- <i data-feather="play"></i> -->
                <span id="match-start-spinner" class="spinner-border spinner-border-sm align-baseline invisible" role="status" aria-hidden="true"></span>
              </button>
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
        <!-- Viewports & VS -->
        <div class="row mt-4">
          <div class="col-5 d-flex justify-content-end viewport-container">
            <div id="player1-viewport">
              <div class="player-placeholder d-flex justify-content-center align-items-center bg-primary">
                <span class="text-white">P1</span>
              </div>
            </div>
            <div class="viewport-transition-spacer"></div>
          </div>
          <div onconnected="${this}" ondisconnected="${this}" id="vs-block" class="col-2 text-center align-self-end text-white">VS</div>
          <div class="col-5 d-flex justify-content-start viewport-container">
          <div class="viewport-transition-spacer"></div>
            <div id="player2-viewport">
              <div class="player-placeholder d-flex justify-content-center align-items-center bg-primary">
                <span class="text-white">P2</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Messages -->
        <div class="row">
          <div class="col-5 d-flex justify-content-start">
            <div id="player1-message" class="player-message collapsed"></div>
          </div>
          <div class="col-2"></div>
          <div class="col-5 d-flex justify-content-end">
            <div id="player2-message" class="player-message collapsed"></div>
          </div>
        </div>`;
  }
}

export default Home;
