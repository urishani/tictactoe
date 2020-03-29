//State Variables
var myTurn = true;
var otherPlayer = 'O';
var currentPlayer = 'X';
var aIDiff = 0;
var iAmPlayer = 'X'
var startingPlayerIsX = true;
var otherPlayerIsAI = true;

var settings = {
    otherPlayerIsAI: false,
    aIDiff: 0,
    iAmPlayer: 'X',
    startingPlayer: 'X',

}
var aIDiff = settings.aIDiff;
var iAmPlayer = settings.iAmPlayer;
var startingPlayer = settings.startingPlayer;
var otherPlayerIsAI = settings.otherPlayerIsAI;


function chooseStarter() {
    currentPlayer = startingPlayer;
}
//-----------------OnClick functions-----------------------//

function applySettings() {
    console.log(JSON.stringify(settings));
    startingPlayer = settings.startingPlayer;
    aIDiff = settings.aIDiff;
    iAmPlayer = settings.iAmPlayer;
    otherPlayer = iAmPlayer === 'X' ? 'O': 'X';
    startingPlayer = settings.startingPlayer;
    otherPlayerIsAI = settings.otherPlayerIsAI;
    myTurn = (startingPlayer === 'X' && iAmPlayer === 'X') || (startingPlayer === 'O' && iAmPlayer === 'O');
    console.log('myTurn: ' + myTurn);
    currentPlayer = startingPlayer;
}


//-----------------main functions---------------------------//


//BOARD DEFINITION
var boardData = [[' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' ']];

function bd2String(){
    var r = '';
    for(var i=0; i< 3; i++) {
        for (var j = 0; j < 3; j++)
            r += tileAt(i,j)===' '?'.':tileAt(i,j);
        r += '\n';
    }
    return r;
}
var boardDisplay = [['0-0', '0-1', '0-2'],
    ['1-0', '1-1', '1-2'],
    ['2-0', '2-1', '2-2']];

//Are. They. Occupied?!
function isOccupied(i,j) {
    return boardData[i][j] !== ' ';
}
function isFree(i,j) {
    return !isOccupied(i,j);
}
function isTile(i,j,what) {
    return boardData[i][j] === what;
}
function isTileX(i,j) {
    return isTile(i,j,'X');
}
function isTileO(i,j) {
    return isTile(i,j,'O');
}

//Set tiles to Xs and Os
function setTile(i,j, what) {
    boardData[i][j] = what;
}
function setTileO(i,j) {
    setTile(i,j, 'O');
}
function setTileX(i,j) {
    setTile(i,j, 'X');
}

function tileAt(i,j) {
    return boardData[i][j];
}
function tileReset(i,j) {
    boardData[i][j] = ' ';
}
function boardReset() {
    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 3; j++) {
            tileReset(i,j);
        }
    }
}

function findEmptyCell() {
    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 3; j++) {
            if (isFree(i,j)) {
                return {i:i, j:j};
            }
        }
    }
    console.log('findEmptyCell: ' + JSON.stringify(boardData));
}

function findRandomEmptyCell() {
    var cell = findEmptyCell();
    if (!cell) {
        return;
    }
    while(true){
        var i = (Math.round(Math.random() * 2));
        var j = (Math.round(Math.random() * 2));
        if (isFree(i,j)) {
            return {i:i, j:j};
        }
    }
}


//AI Code ------------------------------------------------------------------
const io = require('console-read-write');

async function simulate() {
    const humanStart = await io.ask('who starts [1-computer, 0-human]: ') === '0';
    boardReset();
    var player = humanStart ? iAmPlayer : otherPlayer;
    let eb = '';
    while ((eb = evaluateBoard()) === ' ') {
        if (player === iAmPlayer) {
            var move = undefined;
            while (!move) {
                var m = await io.ask('Your move [i, j]: ');
                m = m.indexOf(',') >= 0 ? m.split(',') : m.split(' ');
                if (m.length === 2)
                    m = {i: parseInt(m[0].trim()), j: parseInt(m[1].trim())};
                if (!(m.i >=0 && m.i <=2 && m.j >=0 && m.j <=2)) {
                    console.log('bad i and j. Try again.');
                    continue;
                }
                // console.log('m: ', m);
                if (isFree(m.i, m.j))
                    move = m;
                else console.log('bad move. Try again...');
            }
            setTile(move.i, move.j, player);
        } else {
            var result = runRealAiHelper(player, 0, []);
            console.log('result ', result);
            setTile(result.cell.i, result.cell.j, player);
        }
        console.log(bd2String());
        player = player === iAmPlayer  ? otherPlayer : iAmPlayer;
        console.log('next player ' + player);
    }
    console.log('final result: [' + eb + ']');
    await simulate();
}

// while (evaluateBoard() === ' ') {
//     player = player === 'O' ? 'X' : 'O';
// }
simulate();

function runAI(difficulty = 0) {
    switch(difficulty) {
        case 0: runASS();
            break;
        case 1: runAS();
            break;
        case 2: runAD();
            break;
        case 3: runRealAi();
            break;
    }
}


function runASS() {
    var cell = findEmptyCell();
    if (!cell)
        return;
    gameController(null, cell.i, cell.j);
}


function runAS() {
    var cell = findRandomEmptyCell();
    if (cell) {
        gameController(null, cell.i, cell.j);
    }
}


function runAD() {
    var cell = runAD_Helper();
    if (cell)
        gameController(null, cell.i, cell.j);
    else
        runAS();
}

function runAD_Helper() {

    //1: go over all possible positions
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            //1.1: if position isn't empty, continue.
            if (isOccupied(i,j)) continue;
            //1.2: if it's empty, position piece in position.
            isTile(i,j, otherPlayer);
            //1.3: evaluate.
            var winner = evaluateBoard();
            console.log(winner);
            tileReset(i,j);
            //1.4: if the other person wins, return.
            if (winner === otherPlayer) return {i:i, j:j};
            //1.5: if nobody wins, remove the piece.

        }
    }
    //2: activates if line 1 fails. runAS();
    return null;
}

function runRealAi() {
    var result = runRealAiHelper(otherPlayer, 0, []);
    console.log("result ",JSON.stringify(result));
    // var cell = result.cell;
    // console.log('result ', cell.i, cell.j);
    // console.log("RealAi ran");
}

function runRealAiHelper( piece, level, trace){
    var isComputer = piece === otherPlayer;
    // console.log('trace: ', trace); // "AiHelper "+ piece +" "+ level, 'isComputer ? ', isComputer, boardData);

    // 1. we are given the board. in a certain state of pieces.
    // 2. we get a parameter which piece to put: X or O, and which level in the recursion we are. increase level by 1;
    // 3. we figure out a list of all available places: [{i:i, j:j}, ...]
    var placeList = [];
    for(var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (isOccupied(i,j)) continue; //boardData[i][j] !== "") continue;
            placeList.push({i:i, j:j});
        }
    }
    // 4. let state = -1; let bestN =-1;
    var bestScore;
    // 5. Run over that list: each time we look at the n-th pair.
    var sureWin = false;
    var bestChoices = [];
    for(var n = 0; n < placeList.length; n++) {
        var cell = placeList[n];
        // 5a.   place your piece on the n-th position pair.
        setTile(cell.i, cell.j, piece);
        trace.push(cell.i*3+cell.j);
        // 5b.   var v = evaluateBoard(); //v = 1 if comp. wins, 0 if there's a tie.
        // 5b1. if (!myTurn && otherPlayerIsAi) v = 1 if computer wins; 0 if there's a tie.
        // 5b2. if (myTurn && otherPlayerIsAi) v = 0 if tie, -1 if computer loses
        var v = evaluateBoard(); //v = 1 if comp. wins, 0 if there's a tie.
        var computerWins = v === otherPlayer;
        var computerLoose = v === iAmPlayer;
        // console.log("v")
        if (computerWins) {score = 10-level; } //console.log(bd2String(), score);}
        else if(computerLoose) {score = level-10;} // console.log(bd2String(), score);}
        else score = 0;
        // 5c.   if we win, return 1; if tie && state < 0 {bestN = n, state = 0}
        // 5d.   call this function recursively, with the opposite piece and our level as parameters. obtain the result.
        if (placeList.length > 1 && score === 0) {
            var r = runRealAiHelper(piece === "X" ? "O" : "X", level + 1, trace);
            score = r.v;
        }
        cell.score = score;
        if (isComputer) {
            if ((bestScore === undefined) || (score > bestScore)) {
                bestScore = score;

                    bestChoices = [n]; // start new list of choices.
            } else if ((score === bestScore)
                && isComputer)
                bestChoices.push(n);
        } else if (bestScore === undefined || score < bestScore)
           bestScore = score;
        // 5f.   remove the piece from 5a.
        // console.log(piece, score, bestScore);
        tileReset(cell.i,cell.j);
        trace.pop();
    }
    // 6.  if we are the first call, then position piece in bestN;
    // 7. else return state;
    if (level === 1) {
        // console.log('exiting top level', bestScore, bestChoices, '\n', placeList, '\n', bd2String());
    }
    var result = {v: bestScore, t:placeList, p:piece, bc: bestChoices};
    if (isComputer) { // select cell to place part in random.
        var choice = Math.round(Math.random()*(bestChoices.length-1));
        result.cell = placeList[bestChoices[choice]];
    }
    return result;
}



/**
 Evaluates the board and returns a string with one of the following values:
 X- player X has won
 O- player O has won
 T- Cat's Game, a draw/tie
 ' '- nobody has won, but there are still empty spaces left on the board

 The below section prepares the indexes, then calls evaluateRow for each index.
 */
function evaluateBoard() {
    var indexes = [
        [0, 0, 0, 1, 0, 2],
        [1, 0, 1, 1, 1, 2],
        [2, 0, 2, 1, 2, 2],
        [0, 0, 1, 0 ,2, 0],
        [0, 1, 1, 1, 2, 1],
        [0, 2, 1, 2, 2, 2],
        [0, 0, 1, 1, 2, 2],
        [0, 2, 1, 1, 2, 0]
    ];

    var weHaveSpaceBoii = false;

    for ( var i = 0; i < 8; i++) {
        var a = evaluateRow(boardData, indexes[i]);
        weHaveSpaceBoii = weHaveSpaceBoii || a === ' ';
        if (a !== ' ' && a !== 'T') {
            return a;
        }
    }
    return weHaveSpaceBoii ? ' ' : 'T';
}
/**
 This function is called inside of evaluateBoard. It does the folowing:
 Looks at all cells in the board listed in an index perimeter to see if they all have the same value.
 If this is true, the function will return one of the strings mentioned in the previous comment.
 */
function evaluateRow(board, rowIndexes) {
    var a = board[rowIndexes[0]][rowIndexes[1]];
    var b = board[rowIndexes[2]][rowIndexes[3]];
    var c = board[rowIndexes[4]][rowIndexes[5]];
    if (a === b && b === c) {
        return a
    } else if(a === ' ' || b === ' ' || c === ' ') {
        return ' ';
    } else return 'T';
}



function applyModel() { //makes the game board show Xs and Os based on the model
    for(var i=0; i<3; i++)
        for(var j=0; j<3; j++) {
            boardDisplay[i][j].element.image = boardData[i][j] + '.png';
        }
}



function initBoard() {  //starts EVERYTHING.
    for(var i=0; i<3; i++)
        for(var j=0; j<3; j++) {
            boardDisplay[i][j] = {
                id: boardDisplay[i][j]
            };
            console.log(JSON.stringify(boardDisplay[i][j]));
        }
    applySettings();
}





