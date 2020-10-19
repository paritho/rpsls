const whatBeatsWhat = {
  rock: { lizard: 1, scissors: 1 },
  paper: { rock: 1, spock: 1 },
  scissors: { paper: 1, lizard: 1 },
  lizard: { spock: 1, paper: 1 },
  spock: { scissors: 1, rock: 1 },
};

export default {
  _isValidThrow(playerThrow) {
    return !!whatBeatsWhat[playerThrow];
  },
  evaluate(p1Throw, p2Throw) {
    const p1ThrowIsValid = this._isValidThrow(p1Throw),
      p2ThrowIsValid = this._isValidThrow(p2Throw);
    if (!p1ThrowIsValid) {
      return new Error(
        `Player 1's throw of ${p1Throw} is invalid.${
          !p2ThrowIsValid
            ? " Player 2's throw of " + p2Throw + " is also invalid."
            : ""
        }`
      );
    }
    if (!p2ThrowIsValid) {
      return new Error(`Player 2's throw of ${p2Throw} is invalid.`);
    }
    if (p1Throw === p2Throw) {
      return {
        iDraw: `<h3>Draw</h3>`,
      };
    }
    if (whatBeatsWhat[p1Throw][p2Throw]) {
      return {
        p1Result: "iWon",
        p2Result: "iLost",
      };
    }
    return {
      p1Result: "iLost",
      p2Result: "iWon",
    };
  },
};
