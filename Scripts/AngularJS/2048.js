/// <reference path="../3rdParty/jquery-1.9.0.js" />
/// <reference path="../3rdParty/AngularJS/angular.js" />

//--- [DOCUMENT - Disable Arrow Key Scrolling] --------------------------
var arrowKeys = [37, 38, 39, 40];
$(document).keydown(function (e) {
    var key = e.which;
    console.log('key #' + key + ' pressed');
    if ($.inArray(key, arrowKeys) != -1)
    {
        e.preventDefault();
    }
});


//=========================================================================
// ANGULAR JS
//=========================================================================

angular.module("2048", []);

angular.module("2048").controller('gameController', ['VirtualShift', 'CreateArray', 'GameOverCheck', 'AddTile', 'EmptyTileCheck', function (VirtualShift, CreateArray, GameOverCheck, AddTile, EmptyTileCheck) {
    var game = this;
    var winTileValue = 2048;
    game.gameOver = false;  //if true, should prevent some input like shifting
    game.displayGameLose = false;
    game.gridWidth = 4;     //grid dimensions (always a square x*x)
    game.cellValues = [];   //this array contains the tile values (0 is considered an empty tile)
    game.score = 0;
    game.scoreBest = 0;

    
    //Create arrays for generating UI game board (iterates through to determine row and td count in HTML table)
    game.rows = CreateArray.createArray(game.gridWidth, 0, 1);

    //Must set focus on an HTML element so keypress events can be heard
    //*non <input> elements require tabindex="x" in their element.
    $('#init').focus();


    //=========================================================================
    // CONTROLLER SCOPE FUNCTIONS
    //=========================================================================

    //--- [GAME CONTROLS - KEYBOARD INPUT COMMANDS] --------------------------
    //Deciphers key presses and triggers their related actions.
    game.input = function ($event)
    {
        switch ($event.keyCode) {
            //SHIFT UP
            case 38:
            case 87:
                console.log("keycode = " + $event.keyCode + "; direction = UP");
                shift("up");
                break;
            //SHIFT DOWN
            case 40:
            case 83:
                console.log("keycode = " + $event.keyCode + "; direction = DOWN");
                shift("down");
                break;
            //SHIFT LEFT
            case 37:
            case 65:
                console.log("keycode = " + $event.keyCode + "; direction = LEFT");
                shift("left");
                break;
            //SHIFT RIGHT
            case 39:
            case 68:
                console.log("keycode = " + $event.keyCode + "; direction = RIGHT");
                shift("right");
                break;
                //RESTART GAME
            case 82:
                console.log("keycode = " + $event.keyCode + "; 'R' Restart Game triggered");
                restart();
                break;
        }
    }


    //--- [RESTART GAME] -----------------------------------------------------
    game.restart = function () {
        restart();
    }

    //--- [For Debugging] ----------------------------------------------------
    game.shift = function (dir) {
        shift(dir);
    };

    //=========================================================================
    // INTERNAL FUNCTIONS
    //=========================================================================

    //--- [RESTART/START GAME] ------------------------------------------------------
    //Performs the required functions related to starting a new game.
    //Builds the tile array, adds starting tiles and resets score.
    var restart = function () {
        //make/remake tile array:
        game.cellValues = CreateArray.createArray(game.gridWidth * game.gridWidth, 0, 0);

        //Add the two starting tiles:
        game.cellValues = AddTile.addTile(game.cellValues);
        game.cellValues = AddTile.addTile(game.cellValues);

        //reset score
        game.score = 0;

        game.gameOver = false;
        clearOverlay();
    }


    //--- [SHIFT TILES] -------------------------------------------------------
    //Attempts to shift/stack tiles in the direction supplied (argument) as according to game rules.
    //The cells are arranged into stacks/lines (an array) according to the direction. Each line is checked and treated individually.
    var shift = function (dir) {

        console.log('running shift function');

        if (game.gameOver === false) {

            var isGameOver;
            //check if shiftable - if a shift can be made, returns an obj containing the altered tile values and points earned. If no shift can be made, returns the same obj without any tile values or points.

            console.log("game.cellValues pre-shift = " + game.cellValues);

            var shifted = VirtualShift.virtualShift(dir, game.gridWidth, game.cellValues);


            //If shifted result object contains tileValues, then apply the actual changes and add a new tile.
            if (shifted.tileValues.length > 0) {
                game.cellValues = AddTile.addTile(shifted.tileValues);
                game.score += shifted.points;

                //update best score if exceeded
                if (game.score > game.scoreBest)
                {
                    game.scoreBest = game.score;
                }

                //check if game has been WON!
                if (game.cellValues.indexOf(winTileValue) != -1)
                {
                    game.gameOver = true;
                    setTimeout(function () { displayWinMessage(); }, 3000);
                }

                //Check if game can continue or has ended in a loss
                isGameOver = GameOverCheck.gameOverCheck(game.cellValues, game.gridWidth);

                if (isGameOver) {
                    game.gameOver = true;
                    setTimeout(function () { displayLoseMessage(); }, 1500);
                }
            }
            else {
                //debug
                console.log("Can't make shift in desired direction - no merge possible or no empty tiles to remove.");
            }
        }
        else {
            console.log("Game Over, no shift action executed");
        }

    }


    var displayLoseMessage = function () {
        $("#overlay-loss").fadeIn(2000);
    };
    var displayWinMessage = function () {
        $("#overlay-win").fadeIn(2000);
    };

    var clearOverlay = function () {
        $("#overlay-loss").hide();
        $("#overlay-win").hide();
    };

    
    //=========================================================================
    // START GAME
    //=========================================================================
    restart();

}]);

//================================================================================
//   SERVICES
//================================================================================

angular.module('2048').service("AddTile", function () {
    //--- [ADD TILE] ----------------------------------------------------------
    //Randomly selects a vacant(zero value) tile from supplied tile array, and gives it a valid value.
    //Returns the modified array.
    this.addTile = function (tileValueArray) {
        //generate an array from the cellValues array indicies that have a 0 value
        var zeros = []; //contains indicies holding zero values found in the cellValues[]
        var zInd = 0;   //current index for zeroes
        var tileAddedCell = -1;
        var newTileValue = getValue();  //value of the new tile to be added

        for (var i = 0; i < tileValueArray.length; i++) {
            if (tileValueArray[i] == 0) {
                zeros[zInd] = i;
                zInd += 1;
            }
        }

        //no spots left - do nothing but print in console
        if (zeros.length === 0) {
            console.log("<!> addTile() function: cannot add new tile, no empty spots!");
            return;
        }

        //Randomly choose an index in the zeros[] to change
        tileAddedCell = zeros[Math.ceil(Math.random() * zeros.length) - 1];

        //alter the tileValueArray and return it
        tileValueArray[tileAddedCell] = newTileValue;
        console.log("AddTile Service: Tile is to be added to cell #" + tileAddedCell + " with tile value of " + newTileValue);

        //animate new Tile (disabled)
        //animate(tileAddedCell, 4);

        return tileValueArray;
    };

    //--- [GET VALUE] ---------------------------------------------------------
    //When a new tile is added, it will have a value of either 2 or 4,
    //this function decides which number based on a 'roll'.
    //*This game feature presumably adds some difficulty and unpredictability
    function getValue() {
        var defNum = 2; //default tile value
        var offChance = 20; //percent chance that the value will be a 4
        var offRoll = 100 / offChance;
        var result = defNum;

        var roll = Math.ceil(Math.random() * offRoll);

        if (roll == 1)
        {
            result = defNum * 2;
        }

        return result;
    }

});


//<!> Testing animations - disabled currently
function animate(tileNumber, gridHeight) {
    
    var row = Math.ceil((tileNumber + 1) / gridHeight); //row number (starting at 1)
    var column = (tileNumber + 1) - ((row - 1) * gridHeight);
    var paddingTop = 16;

    //debug
    console.log('column = ' + column);
    console.log('row = ' + row);
    
    //need to get proper dimensions from elements...
    var xOffset = (column * (94 + 9)) - 95;
    var yOffset = (row * (95 + 9)) - 96;

    

    $('#animDiv').parent().css({ position: 'relative' });
    $('#animDiv').css({ top: paddingTop + yOffset + 'px', left: xOffset + 'px', position: 'absolute' });

    $('#animDiv').fadeOut(0, function () {
        $('#animDiv').fadeIn(250);
    });


}



angular.module("2048").service("VirtualShift", ["DoLine", function (DoLine) {
    console.log("running VirtualShift Service");
    //--- [VIRTUAL SHIFT - SHIFT CHECK] -------------------------------------------------------
    //Performs the shift logic of collapsing and merging the tiles in the
    //specified direction, but without actually changing the tiles.
    //Instead the proposed changed tiles are returned.
    this.virtualShift = function (dir, gridWidth, tileValuesArray) {
        var shiftedCellValues = copyArray(tileValuesArray); //will contain proposed updated changes to the tiles

        var lineInc = 0;    //the cell number step that each line in a set (up, down, left, right) needs to add
        var line = [];    //the cellValues[] index that make up the stack line

        if (dir === 'up' || dir === 'down') {
            for (var i = 0; i < gridWidth; i++) {
                line[i] = (i * gridWidth);
            }
            lineInc = 1;
        }
        else if (dir === 'left' || dir === 'right') {
            for (i = 0; i < gridWidth; i++) {
                line[i] = i;
            }
            lineInc = gridWidth;
        }

        //reverse if down or right
        if (dir === "down" || dir === "right") {
            line = line.reverse();
            lineInc = lineInc * -1;
        }

        //CREATE ILINES
        //iLines are the individual lines/stacks of tile index positions. Because
        //the shift happens in one direction, lines are considered independently.
        var iLines = [];    //record of create iLine positions
        var doLineResults = []; //contains the returned values of each doLine(iLine)


        //The number of iLines is the same as number of rows in the game tile grid.
        for (j = 0; j < gridWidth; j++) {
            //The first iLine is determined already and used as the base for subsequent iterations.
            iLine = line;

            //The new cell index numbers for this line (iLine);
            //The first line is unchanged, only subsequent indicies are changed.
            if (j != 0) {
                for (var i = 0; i < iLine.length; i++) {
                    iLine[i] = iLine[i] + Math.abs(lineInc);
                }
            }


            //record the iLines (tile positions)
            //iLines.push(iLine);
            iLines[j] = copyArray(iLine);

            //record each doLine() result (contains the altered tile values for an iLine's indicies, and the score amount of any merges)
            doLineResults[j] = DoLine.doLine(tileValuesArray, iLine);
            
        }

        var shiftable = false;
        for (j = 0; j < doLineResults.length; j++) {
            if (doLineResults[j].tileValues.length !== 0) {
                shiftable = true;
                break;
            }
        }

        var shiftResultObj = new shiftResultObject([], 0);

        //SHIFTABLE ?
        //If shiftable, record the changed tile values and points from any merges in the shiftResultObject object.
        //If not shiftable the changed tile values will be remain empty.
        if (shiftable) {
            var newPoints = 0;

            doLineResults.forEach(function (value, index) {
                if (value.tileValues.length !== 0) {
                    var iLineIndex = iLines[index];

                    //Update the actual tiles that match those listed in the iLine
                    for (j = 0; j < iLineIndex.length; j++) {
                        //*note that the doLineResults[] contains an array of shiftResultObject objects
                        shiftedCellValues[iLineIndex[j]] = value.tileValues[j];
                    }

                    //And add up the points so they can be applied as one total
                    newPoints += value.points;
                }
            });

            console.log("virtual shifted cell values returned = " + shiftedCellValues);
            shiftResultObj.tileValues = shiftedCellValues;
            shiftResultObj.points = newPoints;
        }
        else {
            console.log("no shifted cell values returned!");
        }

        return shiftResultObj;
    }

}]);

angular.module("2048").service("DoLine", ["CompareArrays", function (CompareArrays) {

    //--- [DO LINE] -----------------------------------------------------------
    //Takes an array containing the tile INDEX NUMBERS that make up a stack or line of tiles and performs the action of collapsing and merging them as according to the game rules (remove preceeding and interceding empty tiles, merge adjacent tiles with identical values).
    //Returns a shiftResultObject containing an array (shiftResultObject.tileValues) of the VALUES corresponding to the iLine tile indicies. If the values do not differ to the currently existing values this array is empty. Points are also set on this object.
    //**lineArray = old iLine
    //**tileValuesArray = game.cellValues;
    this.doLine = function (tileValuesArray, lineArray) {
        var originalValues = [];
        var shiftedValues = [];   //new values for the iLine (temp array)
        var mergeScore = 0;
        var resultObj = new shiftResultObject([], 0);
        
        //Find what the current values are for the tiles in this iLine.
        for (i = 0; i < lineArray.length; i++) {
            originalValues[i] = tileValuesArray[lineArray[i]];
        }

        //--- COLLAPSE & MERGE-------------------------------------------------------------
        //Creates an alternate version (shiftedValues[]) of the tile values for the lineArray.

        //Collapse (creates a copy of array without the empty tiles):
        for (i = 0; i < originalValues.length; i++) {
            if (originalValues[i] != 0) {
                shiftedValues.push(originalValues[i]);
            }
        }


        //Merge Adjacent:
        //Check if any adjacent indicies have same value, if so merge the two, and splice
        for (i = 0; i < shiftedValues.length; i++) {
            if (shiftedValues[i] == shiftedValues[i + 1]) {
                var mergeValue = shiftedValues[i] * 2;
                mergeScore += mergeValue;

                shiftedValues[i + 1] = mergeValue;
                shiftedValues.splice(i, 1);
            }
        }

        //fill remainder with empty value (0) to complete the line (can't have null tiles)
        while (shiftedValues.length < lineArray.length) {
            shiftedValues.push(0);
        }

        //if shiftedValues differ from original values add them to the returnObj along with the points to add.
        if (!CompareArrays.compareArrays(shiftedValues, originalValues)) {
            resultObj.tileValues = shiftedValues;
            resultObj.points = mergeScore;
        }

        return resultObj;
    }


}]);

angular.module("2048").service("EmptyTileCheck", function () {
    //--- [ANY EMPTY TILES?] --------------------------------------------------
    //Checks the supplied arrayObj for any 0 value indicies;
    //Returns bool - true if a 0 value exists; false if none;
    this.anyEmptyTiles = function(tileValuesArray) {
        var firstEmpty = tileValuesArray.indexOf(0);
        if (firstEmpty === -1)
        {
            return false;
        }

        return true;
    }
});

angular.module("2048").service("GameOverCheck", ["EmptyTileCheck", 'VirtualShift', function (EmptyTileCheck, VirtualShift) {
    this.gameOverCheck = function (tileValues, gridWidth) {
        //First checks if any empty tiles exist. If no then performs a virtual shift
        //for all directions to check if any future shifts can be performed.
        //If none can be performed the game is considered to be over.
        //Returns true if game over, false if not

        var dirs = ["up", "down", "left", "right"];

        var anyEmpty = EmptyTileCheck.anyEmptyTiles(tileValues);
        if (!anyEmpty) {
            //perform shift check on all directions, if results contain no valid shift options (all result objs contain no tileValues) the game is over
            for (var i = 0; i < dirs.length; i++) {
                var shiftResult = VirtualShift.virtualShift(dirs[i], gridWidth, tileValues);

                if (shiftResult.tileValues.length !== 0) {
                    console.log("====== gameOverCheck() = GAME NOT OVER =======")
                    return false;
                }
            }

            return true;
        }
        return false;
    }
}]);

angular.module("2048").service("CreateArray", function () {
    //--- [CREATE ARRAY] ------------------------------------------------------
    //Creates an array with of the specified length then adds the specified value to each index.
    //The values are incremented by the increment argument.
    this.createArray = function (length, value, increment) {
        var cells = [];
        var inc = 0;

        for (var i = 0; i < length; i++, inc++) {
            cells[i] = value + inc * increment;
        }
        return cells;
    }
});

angular.module("2048").service("CompareArrays", function () {
    this.compareArrays = function (array1, array2) {
        if (array1.length != array2.length) return false;
        if (array1 === array2) return true;
        if (array1 == null || array2 == null) return false;

        for (var i = 0; i < array1.length; i++) {
            if (array1[i] !== array2[i]) return false;
        }

        return true;
    };
});


//================================================================================
//   Global Functions (may need to be turned into Services?)
//================================================================================

//--- [SHIFT RESULT OBJECT] ----------------------------------
//An object format used to return an array of tile values, and a score value.
function shiftResultObject(tileValues, points) {
    this.tileValues = tileValues;
    this.points = points;
};

//--- [COPY ARRAY] -----------------------------------------------------
//Copies existing array values - copying an array the normal way only copies the reference/pointer to the array object and therefore is not an actual copy but the same array.
function copyArray(arrayObj) {
    var copy = []
    for (var i = 0; i < arrayObj.length; i++)
    {
        copy[i] = arrayObj[i];
    }
    return copy;
}


var arrowKeys = [37, 38, 39, 40];

$(document).keydown(function (e) {
    var key = e.which;
    console.log('key #' + key + ' pressed');
    if ($.inArray(key, arrowKeys) != -1)
    {
        e.preventDefault();
    }
});