//your code here!

export const boto = () => {
    const throws = ["rock", "paper", "scissors", "lizard", "spock"];
    return {
        opThrows:[],
        name:"",
        wins:0,
        losses:0,
        play(){},
        paint(element){},
        iWon(){},
        iLost(){},
        lastOpThrow(element){
            this.opThrows.push(element);
        },
    }
}
