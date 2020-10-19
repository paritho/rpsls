const seedhistory = [
  "lizard",
  "paper",
  "scissors",
  "scissors",
  "spock",
  "lizard",
  "spock",
  "lizard",
  "lizard",
  "lizard",
  "spock",
  "lizard",
  "spock",
  "paper",
  "spock",
  "rock",
  "scissors",
  "rock",
  "spock",
  "scissors",
  "paper",
  "paper",
  "rock",
  "paper",
  "rock",
  "paper",
  "spock",
  "lizard",
  "paper",
  "lizard",
  "scissors",
  "rock",
  "lizard",
  "rock",
  "spock",
  "scissors",
  "rock",
  "lizard",
  "rock",
  "spock",
  "scissors",
  "rock",
  "rock",
  "lizard",
  "spock",
  "paper",
  "lizard",
  "spock",
  "scissors",
  "paper",
  "spock",
  "paper",
  "rock",
  "scissors",
  "scissors",
  "paper",
  "paper",
  "spock",
  "scissors",
  "lizard",
  "rock",
  "scissors",
  "scissors",
  "spock",
  "lizard",
  "lizard",
  "scissors",
  "paper",
  "lizard",
  "scissors",
  "spock",
  "scissors",
  "rock",
  "spock",
  "spock",
  "scissors",
  "lizard",
  "paper",
  "rock",
  "paper",
  "scissors",
  "scissors",
  "rock",
  "spock",
  "scissors",
  "rock",
  "paper",
  "paper",
  "lizard",
  "scissors",
  "rock",
  "lizard",
  "spock",
  "paper",
  "lizard",
  "lizard",
  "rock",
  "lizard",
  "paper",
  "paper",
  "rock",
  "lizard",
  "scissors",
  "rock",
  "scissors",
  "spock",
  "rock",
  "lizard",
  "spock",
  "lizard",
];

const whatBeatsWhat = {
  rock: { lizard: 1, scissors: 1 },
  paper: { rock: 1, spock: 1 },
  scissors: { paper: 1, lizard: 1 },
  lizard: { spock: 1, paper: 1 },
  spock: { scissors: 1, rock: 1 },
};

const losesTo = {
  rock: { paper: 1, spock: 1 },
  paper: { scissors: 1, lizard: 1 },
  scissors: { rock: 1, spock: 1 },
  lizard: { rock: 1, scissors: 1 },
  spock: { lizard: 1, paper: 1 },
};

/*combos
    rock, paper --> paper
    rock, scissors --> spock
    rock, lizard --> rock
    rock, spock --> paper
    paper,scissors --> scissors
    paper, lizard --> scissors
    paper, spock --> lizard
    scissors, lizard --> rock
    scissors, spock --> spock
    lizard, spock --> lizard
*/
const best = (el1, el2) => {
    const order = {
        rock:{name:"rock",ord:1}, paper:{name:"paper",ord:2},scissors:{name:"scissors",ord:3},lizard:{name:"lizard",ord:4},spock:{name:"spocl",ord:5}
    }
    const ordered = [order[el1], order[el2]];
    ordered.sort((a,b)=> a.ord - b.ord);
    const first = ordered[0].name;
    const sec = ordered[1].name;
    let tothrow = "lizard";
    switch(first){
        case "rock":
            tothrow = 'paper';
            if(sec === "scissors"){
                tothrow = 'spock';
            }
            if(sec === 'lizard'){
                tothrow = 'rock'
            }
            break;
        case 'paper':
            tothrow = 'scissors';
            break;
        case 'scissors':
            tothrow = 'spock';
            if(sec === 'lizard'){
                tothrow = 'rock'
            }
            break;            
    }
    return tothrow;
}

export const robot = () => {
  const throws = ["rock", "paper", "scissors", "lizard", "spock"];
  return {
    name: "",
    wins: 0,
    losses: 0,
    history: [],
    counts:{ rock: 1, paper: 1, scissors: 1, lizard: 1, spock: 1 },
    play() {
      const total = this.history.length > 1 ? this.history.length : 1;
      const els = [
        { name: "rock", freq: this.counts.rock / total },
        { name: "paper", freq: this.counts.paper / total },
        { name: "scissors", freq: this.counts.scissors / total },
        { name: "lizard", freq: this.counts.lizard / total },
        { name: "spock", freq: this.counts.spock / total },
      ];
      els.sort((a, b) => a.freq - b.freq);
      const leastFreq = els[0].name;
      const mostFreq = els[4].name;
      return best(leastFreq, mostFreq);
    },
    paint(element) {},
    iWon() {
      this.wins++;
      return "<div>I won.</div>";
    },
    iLost() {
      this.losses++;
      return "<div>I lost.</div>";
    },
    lastOpThrow(element) {
      this.counts[element]++;
      this.history.push(element);
    },
  };
};
