//creates a readline interface for handling console input
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

//a class that handles the actual objects of the game...Ex: the game board, Xs,Os, and their placement on the board
class Board {
    constructor() {
        this.board = this.createBoard();
        this.clearBoard();
    }

    //creates a 3x3 array for storing the Xs and Os
    createBoard() {
        let new_array = new Array(3);
        for(let i = 0; i < 3; i++) {
            new_array[i] = new Array(3);
        }
        return new_array;
    }

    //Sets all board spaces to the empty value of 0
    clearBoard() {
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                this.board[i][n] = 0;
            }
        }
    }

    //takes the symbols -1(O), 1(X), and places them on the board 
    makeMove(symbol, x, y) {
        if(this.board[x][y] != 0) return true; //return weather the board position is already taken
        this.board[x][y] = symbol; //place X or O at the desired board position
        return false; //return that the board position is not taken
    }

    //checks if 3 and a row have been met. The symbol is -1(O) or 1(X)
    isWin(symbol) {
        let win = 
        (
            //horizontal
            this.board[0][0]+this.board[0][1]+this.board[0][2] == symbol*3 ||
            this.board[1][0]+this.board[1][1]+this.board[1][2] == symbol*3 ||
            this.board[2][0]+this.board[2][1]+this.board[2][2] == symbol*3 ||
            //vertical
            this.board[0][0]+this.board[1][0]+this.board[2][0] == symbol*3 ||
            this.board[0][1]+this.board[1][1]+this.board[2][1] == symbol*3 ||
            this.board[0][2]+this.board[1][2]+this.board[2][2] == symbol*3 ||
            //diagonal
            this.board[0][0]+this.board[1][1]+this.board[2][2] == symbol*3 ||
            this.board[0][2]+this.board[1][1]+this.board[2][0] == symbol*3
        );
        return win;
    }

    //checks if all board positions have been filled
    isEnd() {
        let count = 0;
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                if(this.board[i][n] != 0) count++; //increment a counter for each filled space
            }
        }
        return count >= 9; //returns true if 3x3 grid is full
    }

    //helper async function for any AI...returns the first open space found
    async getFreeSpace() {
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                if(this.board[i][n] == 0) return [i, n] //return the space as x,y value pair
            }
        }
    }

    //print the game board
    printBoard() {
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                let symbol = ''; //storage for actual character to print
                if(this.board[i][n] == 0) symbol = ''; //board position is empty
                if(this.board[i][n] == 1) symbol = 'X'; //board position is X
                if(this.board[i][n] == -1) symbol = 'O'; //board position is O
                process.stdout.write("["+symbol+"]"); //print the space
            }
            console.log(); //needed for the newline after each 3 spaces
        }
    }

}

//represents common information about the players
class Player {
    constructor() {
        this.name = 'name';
        this.symbol = 'X';
    }

    //returns the actual representation of a player symbol -1(O) or 1(X)
    getSymbolAsInt() {
        if(this.symbol == 'X') return 1;
        else return -1;
    }

}


//class that manages the "state" of the game
class Game {
    constructor() {
        this.twoPlayer = false;
        this.board = new Board();
        this.player = new Player();
        this.player2 = new Player();
    }

    //function that takes player2 and places their symbol automatically at the nearest open space
    async aiMakeMove(player) {
        console.log("It is now the AI's turn! ");
        let move = await this.board.getFreeSpace()
        this.board.makeMove(player.getSymbolAsInt(), move[0], move[1]);
    }

    //function that takes a player and places their symbol where they choose
    async playerMakeMove(player) {
        console.log(player.name+" it is now your turn! ");
        let x = await prompt("which row? ");
        let y = await prompt("which column? ");
        return this.board.makeMove(player.getSymbolAsInt(), x, y);
    }

    //helper function that checks if a player has won, or if the game has ended in a tie
    async isEndGame(player) {
        //thanos snap == false

        //check if player has one and return
        if(this.board.isWin(player.getSymbolAsInt())) {
            console.log(player.name+" is the winner! ");
            return true;
        }
        //checks if game has ended in a tie
        if(this.board.isEnd()) {
            console.log("Tied Game! ");
            return true;
        }

        return false; //the game continues
    }

    //starts a new instance of the game and runs it
    async gameStart() {
        this.board.clearBoard(); //if new game this clears the board
        this.player.name = await prompt("What is your name? "); //get player 1 name
        this.player.symbol = await prompt(this.player.name+' which symbol would you like to use (X / O): '); // get which symbol THIS HAS NO INPUT VALIDATION

        this.twoPlayer = !isStringBool(await prompt("Are you playing alone? (Y / N): ")); //ask if their are two people playing the game Y = One person, N = Two People
        //ask the name of player two or set player two name to AI
        if(this.twoPlayer) {
            this.player2.name = await prompt("What is the other players name? ");
        } else this.player2.name = "AI";
        
        //set player two's symbol to the opposite of player one
        if(this.player.symbol == "X") this.player2.symbol = "O";
        else this.player2.symbol = "X";
        
        let quit = false; //checks when to quit
        try {
            while(!quit) {
                while(await this.playerMakeMove(this.player)) console.log("Invalid Move - Space is already Taken!"); //player one moves in valid spot
                this.board.printBoard(); //print the updated board
                quit = await this.isEndGame(this.player); //check if player one has won
                if(quit) break; //break the loop if player one has won

                //if their is a second player, let them make a move into an empty space, else the ai makes a move
                if(this.twoPlayer) while(await this.playerMakeMove(this.player2)) console.log("Invalid Move - Space is already Taken!");
                else await this.aiMakeMove(this.player2);
                this.board.printBoard(); //print the updated board
                quit = await this.isEndGame(this.player2); //check if player two, or the AI have won
                if(quit) break; //break the loop if player two, or the AI have won
            }
        } catch (error) {
            console.log("FROM TRY CATCH BLOCK! MAY BE FALSE POSATIVE!? \n"+error);
        }
    }


}

//takes in a string and compares it to common truth statements
function isStringBool(str) {
    str = str.toLowerCase(); //ensures input is not case sensative
    return String(true) == str || str == 'y' || str == 'yes'; //return true or false
}

//this async function helps solve the problem of readline ONLY BEING ASYNC
async function prompt(question) {
    //the promise ensures readline waits for a response to question function and returns it
    //...so that variables are properly set and lines use them are not prematurely executed
    return new Promise((resolve, reject) => {
        readline.question(question, (answer) => {
            resolve(answer);
        });
    });
}

//this async function starts the program
async function start() {
    const game = new Game(); //create an instance of the game
    //when the game.startGame function returns check if player wants to play again
    while(isStringBool(await prompt("Would you like to play (Y / N): "))) await game.gameStart();
    readline.close(); //close readline so player is not left at blank input line
}


start(); //start the program