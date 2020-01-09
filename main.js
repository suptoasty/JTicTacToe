const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

class Board {
    constructor() {
        this.board = this.createBoard();
        this.clearBoard();
    }

    createBoard() {
        let new_array = new Array(3);
        for(let i = 0; i < 3; i++) {
            new_array[i] = new Array(3);
        }
        return new_array;
    }

    clearBoard() {
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                this.board[i][n] = 0;
            }
        }
    }

    makeMove(symbol, x, y) {
        this.board[x][y] = symbol;
    }

    isWin(symbol) {
        let win = 
        (
            //horizontal
            this.board[0][0]+this.board[0][1]+this.board[0][2] == symbol*3 ||
            this.board[1][0]+this.board[1][1]+this.board[2][2] == symbol*3 ||
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

    isEnd() {
        let count = 0;
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                if(this.board[i][n] != 0) count++;
            }
        }
        return count >= 9;
    }

    async getFreeSpace() {
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                if(this.board[i][n] == 0) return [i, n]
            }
        }
    }

    printBoard() {
        for(let i = 0; i < 3; i++) {
            for(let n = 0; n < 3; n++) {
                let symbol = '';
                if(this.board[i][n] == 0) symbol = '';
                if(this.board[i][n] == 1) symbol = 'X';
                if(this.board[i][n] == -1) symbol = 'O';
                process.stdout.write("["+symbol+"]");
            }
            console.log();
        }
    }

}

class Player {
    constructor() {
        this.name = 'name';
        this.symbol = 'X';
    }

    getSymbolAsInt() {
        if(this.symbol == 'X') return 1;
        else return -1;
    }

}

class Game {
    constructor() {
        this.twoPlayer = false;
        this.board = new Board();
        this.player = new Player();
        this.player2 = new Player();
    }

    async aiMakeMove(player) {
        console.log("It is now the AI's turn! ");
        let move = await this.board.getFreeSpace()
        this.board.makeMove(player.getSymbolAsInt(), move[0], move[1]);
    }

    async playerMakeMove(player) {
        console.log(player.name+" it is now your turn! ");
        let x = await prompt("which row? ");
        let y = await prompt("which column? ");
        this.board.makeMove(player.getSymbolAsInt(), x, y);
    }

    isEndGame(player) {
        //thanos snap == false
        if(this.board.isWin(player.getSymbolAsInt())) {
            console.log(player.name+" is the winner! ");
            return true;
        }
        if(this.board.isEnd()) {
            console.log("Tied Game! ");
            return true;
        }
        return false;
    }

    async gameStart() {
        this.board.clearBoard();
        this.player.name = await prompt("What is your name? ");
        this.player.symbol = await prompt(this.player.name+' which symbol would you like to use (X / O): ');
        console.log(this.player.symbol);

        let twoPlayer = !isStringBool(await prompt("Are you playing alone? (Y / N): "));
        if(twoPlayer) {
            this.player2.name = await prompt("What is the other players name? ");
        }
        if(this.player.symbol == "X") this.player2.symbol = "O";
        else this.player2.symbol = "X";
        
        let quit = false;
        try {
            while(!quit) {
                await this.playerMakeMove(this.player);
                this.board.printBoard();
                quit = this.isEndGame(this.player);
                if(quit) break;

                if(this.twoPlayer) await this.playerMakeMove(this.player2);
                else await this.aiMakeMove(this.player2);
                this.board.printBoard();
                quit = this.isEndGame(this.player2);
                if(quit) break;
            }
        } catch (error) {
            console.log(error);
        }
    }


}

function isStringBool(str) {
    str = str.toLowerCase();
    return String(true) == str || str == 'y' || str == 'yes';
}

async function prompt(question) {
    return new Promise((resolve, reject) => {
        readline.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function start() {
    const game = new Game();
    await game.gameStart();
    readline.close();
}

start();