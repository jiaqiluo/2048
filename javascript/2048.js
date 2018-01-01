// CS410P Project
// Jiaqi Luo

var all_numbers = new Array(); // This is for saving all numbers on the board.
var score = 0;
var has_merged = new Array(); // This is used for soving conflicts.
var sound_move;
var play_sound = false;

$(document).ready(function() {
    newGame();
    $(".button").click(function() {
        newGame();
    });
    // ----------------------------------------------
    // the sound file is downloaded from:
    // http://themushroomkingdom.net/wav.shtml
    sound_move = document.createElement('audio');
    sound_move.setAttribute('src', "audio/move.wav");
    // ----------------------------------------------
});


$(document).keydown(function(event) {
    event.preventDefault();
    // after eaching moving, add a new tile to the board,
    // and check whether the game is over
    if (move(event.keyCode)) {
        setTimeout("addOneNumber()", 210);
        setTimeout('isGameover()', 300);
    }
});

// this function starts a new game
function newGame() {
    // initialize both arrays
    for (var i = 0; i < 4; i++) {
        all_numbers[i] = new Array();
        has_merged[i] = new Array();
        for (var j = 0; j < 4; j++) {
            all_numbers[i][j] = 0;
            has_merged[i][j] = false;
        }
    }
    updateBoardView();
    score = 0;
    showScore(score);
    showBestScore(getBestScore());
    // show two numbers on the board
    addOneNumber();
    addOneNumber();
}

// generate one number which is either 2 or 4,
// and add it to a random-picked free position on the board
// return:
//     ture if success
//     false otherwise
function addOneNumber() {
    randNum = Math.random() > 0.5 ? 4 : 2;
    var position = generatePosition();
    if (position !== false) {
        [x, y] = position;
        all_numbers[x][y] = randNum;
        showTile(x, y, randNum);
        return true;
    }
}

// generate the coordinate of an avaiable position on the board
// return:
//     false if the board is full
//     [x,y] if finding a position
function generatePosition() {
    //return false if the board is full
    if (isFull() === true) {
        return false;
    }
    var randX, randY, time = 0;
    do {
        time++;
        randX = Math.floor(Math.random() * 4);
        randY = Math.floor(Math.random() * 4);
    } while (all_numbers[randX][randY] && (time < 20))
    // if it cannot find a valid position after 20 tries,
    // traverses the board for a valid one
    if (time == 20) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (!all_numbers[i][j]) {
                    randX = i;
                    randY = j;
                    return [randX, randY];
                }
            }
        }
    }
    return [randX, randY];
}


// this function shows a tile on the board
function showTile(i, j, num) {
    // append the number to its corresponding position in the table in HTML
    var item = $("tr:eq(" + i + ")").children("td:eq(" + j + ")")
        .append("<p>" + num + "</p>").children("p");
    // set its properties
    item.css("background-color", getBackgroundColorByNumber(num));
    item.css("color", getWordColorByNumber(num));
    item.fadeIn("normal");
}


// this function returns the background color for each number
function getBackgroundColorByNumber(num) {
    var colors = {
        2: '#eee4da',
        4: '#eee0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#9c0',
        1024: '#33b5e5',
        2048: '#09c',
        4096: '#a6c',
        8192: '#93c'
    }
    return colors[num]
}


// this function returns the color of the number
function getWordColorByNumber(num) {
    if (num > 4) {
        return "snow";
    } else {
        return "#66615d";
    }
}


// this function redraws all tiles
function updateBoardView() {
    //  at first, clean the table
    $("td").empty();
    // then append numbers to their conrespondding positions
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (all_numbers[i][j]) {
                showTile(i, j, all_numbers[i][j]);
            }
            has_merged[i][j] = false;
        }
    }
}

// Check whether the board is fill or not
// return:
//      ture : the board is full
//      false: not full
function isFull() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            //  not full if there is a 0
            if (all_numbers[i][j] === 0) {
                return false;
            }
        }
    }
    return true;
}


function showScore(score) {
    $(".score-container").text(score);
}


function showBestScore(score) {
    if (score) {
        $(".best-container").text(score);
    }
}


// this function gets the best score from the local storage if it exists
function getBestScore() {
    if (typeof(Storage) !== "undefined") {
        return localStorage.getItem("best");
    }
    return 0;
}


// this function sets the best score in the local storage
// return:
//      true: success
//      false: fail
function setBestScore(score) {
    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("best", score);
        return true;
    }
    return false;
}


// this function manages the movement of all tiles for each time the user
// presses the arrow key.
// ----------------------------------------------
// the algorithm of this function is inspired by
// https://segmentfault.com/a/1190000008446020
// ----------------------------------------------
function move(direction) {
    play_sound = false;
    // do nothing if we cannot move in this direction
    if (!canMove(direction)) {
        return false;
    }
    // 37 - left arrow
    // 38 - up arrow
    var start = 1,
        end = 4,
        step = 1,
        d = 0;
    // 39 - right arrow
    // 40 - down arrow
    if (direction == 39 || direction == 40) {
        start = 2;
        end = -1;
        step = -1;
        d = 3;
    }
    for (var i = 0; i < 4; i++) {
        for (var j = start; j != end; j += step) {
            switch (direction) {
                case 37:
                case 39:
                    if (all_numbers[i][j]) {
                        for (var k = d; direction == 37 ? (k < j) : (k > j); k += step) {
                            if (!all_numbers[i][k] && (direction == 37 ? notBlockHorizontally(i, k, j) : notBlockHorizontally(i, j, k))) {
                                moveAnimation(i, j, i, k); //move the tile
                                // update board
                                all_numbers[i][k] = all_numbers[i][j];
                                all_numbers[i][j] = 0;
                                break;
                            } else if (all_numbers[i][k] == all_numbers[i][j] &&
                                (direction == 37 ? notBlockHorizontally(i, k, j) : notBlockHorizontally(i, j, k)) &&
                                !has_merged[i][k]) {
                                moveAnimation(i, j, i, k);
                                // update board and score
                                all_numbers[i][k] += all_numbers[i][j];
                                all_numbers[i][j] = 0;
                                score += all_numbers[i][k];
                                play_sound = true;
                                showScore(score);
                                if (score > getBestScore()) {
                                    setBestScore(score);
                                    showBestScore(score);
                                }
                                // this makes sure that we don't merge the same tile twice
                                has_merged[i][k] = true;
                                break;
                            }
                        }
                    }
                    break;
                case 38:
                case 40:
                    if (all_numbers[j][i]) {
                        for (var k = d; direction == 38 ? (k < j) : (k > j); k += step) {
                            if (!all_numbers[k][i] && (direction == 38 ? notBlockVertically(i, k, j) : notBlockVertically(i, j, k))) {
                                moveAnimation(j, i, k, i);
                                all_numbers[k][i] = all_numbers[j][i];
                                all_numbers[j][i] = 0;
                                break;
                            } else if (all_numbers[k][i] == all_numbers[j][i] &&
                                (direction == 38 ? notBlockVertically(i, k, j) : notBlockVertically(i, j, k)) &&
                                !has_merged[k][i]) {
                                moveAnimation(j, i, k, i);
                                all_numbers[k][i] += all_numbers[j][i];
                                all_numbers[j][i] = 0;
                                score += all_numbers[k][i];
                                play_sound = true;
                                showScore(score);
                                if (score > getBestScore()) {
                                    setBestScore(score);
                                    showBestScore(score);
                                }
                                break;
                            }
                        }
                    }
                    break;
            }
        }
    }
    if (play_sound === true) {
        sound_move.play();
    }
    setTimeout("updateBoardView()", 50);
    return true;
}


// check whether there are spaces between two tiles horizontally
// return:
//      true - there are spaces between those two tiles
//      false - No space between those two tiles
function notBlockHorizontally(row, col1, col2) {
    for (var i = col1 + 1; i < col2; i++) {
        if (all_numbers[row][i]) {
            return false;
        }
    }
    return true;
}


// check whether there are spaces between two tiles vertically
// return:
//      true - there are spaces between those two tiles
//      false - No space between those two tiles
function notBlockVertically(col, row1, row2) {
    for (var i = row1 + 1; i < row2; i++) {
        if (all_numbers[i][col]) {
            return false;
        }
    }
    return true;
}



// this function shows the animation of moving one tile from (formX, fromY) to (toX, toY)
// return:
//      none
function moveAnimation(fromX, fromY, toX, toY) {
    var tem = $("tr:eq(" + fromX + ")").children("td:eq(" + fromY + ")").children("p");
    tem.animate({
        top: (toX * (100 + 23.6) + 13) + "px",
        left: (toY * (100 + 23) + 13) + "px"
    }, 130);
}


// check if we can move in the current direction
// return:
//      ture - can move
//      false - cannot move
function canMove(direction) {
    // 37 - left arrow
    // 38 - up arrow
    var a = 1,
        b = 4,
        c = 1;
    // 39 - right arrow
    // 40 - down arrow
    if (direction == 39 || direction == 40) {
        a = 2;
        b = -1;
        c = -1;
    }
    for (var i = 0; i < 4; i++) {
        for (var j = a; j != b; j += c) {
            switch (direction) {
                // when moving left or rigth, we check whether there are either free space
                // or two adjacent tiles with the same number in the same row
                case 37:
                case 39:
                    if (all_numbers[i][j]) {
                        if (all_numbers[i][j - c] == 0 || all_numbers[i][j] == all_numbers[i][j - c]) {
                            return true;
                        }
                    }
                    break;
                case 38:
                case 40:
                    // when moving up or down, we check whether there are either free space
                    // or two adjacent tiles with the same number in the same column
                    if (all_numbers[j][i]) {
                        if (all_numbers[j - c][i] == 0 || all_numbers[j][i] == all_numbers[j - c][i]) {
                            return true;
                        }
                    }
                    break;
            }
        }
    }
    return false;
}

// this function checks whether the game is over. If game is over, it will show
// a message, and start a new game.
function isGameover() {
    if (isFull() && noMove()) {
        alert("Game Over\nYour scores is: " + $(".score-container").text());
        newGame();
    }
}


// check whether we can move any tile on the board to any direction
// return:
//      true: cannot move
//      false: can move
function noMove() {
    if (canMove(37) || canMove(38) || canMove(39) || canMove(40)) {
        return false;
    }
    return true;
}
