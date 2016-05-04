/// <reference path="../3rdParty/AngularJS/angular.min.js" />
/// <reference path="../3rdParty/AngularJS/angular-mocks.js" />
/// <reference path="../jasmine/jasmine.js" />
/// <reference path="../jasmine/boot.js" />

//Notes on Unit Testing

//Jasime - Behaviour Driven Development framework for JS.
//Jasmine can be used with a TDD approach. It provides structure and functions for assertions.


//Test: DoLine() tests

describe("2048", function () {
    var scope;
    beforeEach(angular.mock.module("2048"));

    //=================================================
    //  CONTROLLER
    //=================================================
    describe('GAME CONTROLLER', function () {
        var game;
        var newTileValues = [8, 4, 8, 0, 0, 16, 2, 4, 0];

        describe('', function () {
            beforeEach(inject(function ($controller) {
                game = $controller('gameController');
            }));

            it('should exist', function () {
                expect(game.gridWidth).toBeDefined();
            });
        });

        describe('Restart function', function () {
            var mockVirtualShift = {
                virtualShift: function (x, y, z) {
                    return {
                        tileValues: newTileValues,
                        points: 32
                    };
                }
            };

            beforeEach(module(function ($provide) {
                $provide.value('VirtualShift', mockVirtualShift)
            }));

            beforeEach(inject(function ($controller) {
                game = $controller('gameController');
            }));

            it('should create the correct number of tile slots', function () {
                game.restart();
                expect(game.cellValues.length).toEqual(game.gridWidth * game.gridWidth);
            });
            it('should fill all but two slots with empty (zero) values', function(){
                game.restart();
                var zeroCount = 0;

                for (i = 0; i < game.cellValues.length; i++)
                {
                    if (game.cellValues[i] === 0)
                    {
                        zeroCount++;
                    }
                }

                expect(zeroCount).toEqual(game.cellValues.length - 2);
            });
        });

        describe('Shift Tiles function', function () {
            var tileArray = [8, 4, 8, 0, 0, 16, 2, 4, 0];

            describe('with shiftable result:', function () {
                var mockVirtualShift = {
                    virtualShift: function (x, y, z) {
                        return {
                            tileValues: newTileValues,
                            points: 32
                        };
                    }
                };

                beforeEach(module(function ($provide) {
                    $provide.value('VirtualShift', mockVirtualShift)
                }));

                beforeEach(inject(function ($controller) {
                    game = $controller('gameController');
                }));

                it('should change tile values', function () {
                    var prevValues = tileArray;
                    game.cellValues = prevValues;
                    var tileCount = game.cellValues.length;

                    game.shift('up');
                    //make sure array has the same number of tiles too
                    expect(game.cellValues.length).toEqual(tileCount);
                    expect(game.cellValues).not.toEqual(prevValues);
                });

                
                it('should add additional points to score', function () {
                    //toDo
                });
                it('should trigger gameOverCheck', function () { });
            });

            describe('with non-shiftable result:', function () {
                var mockVirtualShift = {
                    virtualShift: function (x, y, z) {
                        return {
                            tileValues: [],
                            points: 32
                        };
                    }
                };

                beforeEach(module(function ($provide) {
                    $provide.value('VirtualShift', mockVirtualShift)
                }));

                beforeEach(inject(function ($controller) {
                    game = $controller('gameController');
                }));

                it('should not change tiles if shift was unsuccessful', function () {
                    var prevValues = tileArray;
                    game.cellValues = prevValues;
                    var tileCount = game.cellValues.length;

                    game.shift('up');
                    expect(game.cellValues).toEqual(prevValues);
                });
                it('should not add any additional points', function () {
                    //toDo
                });
                it('should not trigger gameOverCheck', function () {

                });
            });

        });

        describe('GameOver Check function', function () { });

    });


    //=================================================
    //  SERVICES
    //=================================================
    describe('SERVICES', function () {
        //=== DO LINE SERVICE =============================
        describe('DoLine service', function () {
            var DoLine;
            var tileValues = [2, 0, 2, 0, 0, 0, 2, 4, 4];   //a 3x3 game grid
            var lineTilePositions = [0, 3, 6];  //left most vertical line (the tile idicies corresponding to tileValues)


            describe('- With CompareArrays mock returning false', function () {
                beforeEach(function () {
                    var mock = { compareArrays: function (array1, array2) { return false; } };

                    //$provide.value configures a service - we are substituting in the mock object so to test only this service (DoLine) in isolation (as DoLine depends on CompareArrays).
                    module(function ($provide) {
                        $provide.value('CompareArrays', mock);
                    });
                });
                beforeEach(inject(function ($injector) {
                    DoLine = $injector.get('DoLine');
                }));

                it("should return an object with defined 'tileValues' and 'points' properties.", function () {
                    var result = DoLine.doLine([], []);

                    expect(result.tileValues).toBeDefined();
                    expect(result.points).toBeDefined();
                });
                it("should remove preceeding and 'inbetween' zeros, and shift other values up; zeros should be added to fill remaining positions.", function () {
                    var result = DoLine.doLine(tileValues, [1, 4, 7]);  //tile values = [0, 0, 4]
                    expect(result.tileValues).toEqual([4, 0, 0]);

                    result = DoLine.doLine(tileValues, [2, 5, 8]);  //tile values = [2, 0, 4]
                    expect(result.tileValues).toEqual([2, 4, 0]);
                });
                it('should merge pairs of identical numbers.', function () {
                    var result = DoLine.doLine(tileValues, lineTilePositions);
                    expect(result.tileValues).toEqual([4, 0, 0]);
                });
                it('should return points property equal to the merged values', function () {
                    var result = DoLine.doLine(tileValues, lineTilePositions);
                    expect(result.points).toEqual(4);
                });
            });

            describe('- With CompareArrays mock returning true (no changes to be made to the line)', function () {
                beforeEach(function () {
                    var mock = { compareArrays: function (array1, array2) { return true; } };

                    module(function ($provide) {
                        $provide.value('CompareArrays', mock);
                    });
                });

                beforeEach(inject(function ($injector) {
                    DoLine = $injector.get('DoLine');
                }));

                it('should return an object with an empty "tileValues" property', function () {
                    var result = DoLine.doLine(tileValues, lineTilePositions);
                    expect(result.tileValues).toEqual([]);
                });
            });
        });

        //=== VIRTUAL SHIFT SERVICE =======================
        describe('VirtualShift service', function () {
            var service;
            //var mockDoLine;
            var mockCopyArray;
            var mockShiftResultObject;
            var dir = 'up';
            var gridWidth = 3;  //3x3 grid = 9 indicies
            var tilesArray = [2, 2, 0, 0, 0, 4, 2, 0, 0];
            var doLinePoints = 8;
            var doLineReturnMockObj = { tileValues: [8, 16, 32], points: doLinePoints };


            //DoLine service mocked - same result for all lines
            beforeEach(module(function ($provide) {
                mockDoLine = {
                    doLine: function (tileValues, tilePositions) {
                        return doLineReturnMockObj;
                    }
                };

                $provide.value('DoLine', mockDoLine);
            }));

            beforeEach(inject(function (_VirtualShift_) {
                service = _VirtualShift_;
            }));


            it('should return an object with defined "tileValues" and "points" properties.', function () {
                var result = service.virtualShift('up', gridWidth, tilesArray);

                expect(result.tileValues).toBeDefined();
                expect(result.points).toBeDefined();
            });

            it('should return object.tileValues containing correct number of tiles', function () {
                var result = service.virtualShift('up', gridWidth, tilesArray);
                expect(result.tileValues.length).toEqual(9);
            });

            it('should return correct total of points earned', function () {
                var result = service.virtualShift('up', gridWidth, tilesArray);
                expect(result.points).toEqual(doLinePoints * gridWidth);
            });

        });

        //=== GAME OVER CHECK SERVICE =====================
        describe('GameOver Check service', function () {
            var service;
            var mockEmptyTileCheck;
            var mockVirtualShift;

            it('should be gameover if no empty tile slots exist, and no merges are possible in any direction', function () {
                //*Note: a zero length index for virtualShift resultObject.tileValues indicates that no shift was possible - hence the empty [] in the mock.
                mockEmptyTileCheck = { anyEmptyTiles: function (x) { return false; } };
                mockVirtualShift = { virtualShift: function (x, y, z) { return { tileValues: [], points: 0 } } };

                module(function ($provide) {
                    $provide.value('EmptyTileCheck', mockEmptyTileCheck);
                    $provide.value('VirtualShift', mockVirtualShift);
                });

                inject(function (GameOverCheck) {
                    service = GameOverCheck;
                });

                expect(service.gameOverCheck(["mocks make me redundant"])).toEqual(true);
            });

            it('should NOT be gameover if an empty tile slots exists', function () {
                mockEmptyTileCheck = { anyEmptyTiles: function (x) { return true; } };

                module(function ($provide) {
                    $provide.value('EmptyTileCheck', mockEmptyTileCheck);
                });

                inject(function (GameOverCheck) {
                    service = GameOverCheck;
                });

                expect(service.gameOverCheck(["mocks make me redundant"])).toEqual(false);
            });

            it('should NOT be gameover if a merge is possible - (with no empty tile slots)', function () {
                mockEmptyTileCheck = { anyEmptyTiles: function (x) { return false; } };
                mockVirtualShift = { virtualShift: function (x, y, z) { return { tileValues: [1, 2, 3], points: 0 } } };

                module(function ($provide) {
                    $provide.value('EmptyTileCheck', mockEmptyTileCheck);
                    $provide.value('VirtualShift', mockVirtualShift);
                });

                inject(function (GameOverCheck) {
                    service = GameOverCheck;
                });

                expect(service.gameOverCheck(["mocks make me redundant"])).toEqual(false);
            });
        });

        //=== COMPARE ARRAYS SERVICE ======================
        describe("CompareArrays Service", function () {
            var array1 = [0, 1, 2, 3, 4];
            var array2 = [0, 2, 2, 3];
            var array3 = [0, 1, 2, 3, 4];
            var service;

            beforeEach(inject(function ($injector) {
                service = $injector.get('CompareArrays');
            }));

            it("should return true if arrays match: [" + array1 + "], [" + array3 + "]", function () {
                var result = service.compareArrays(array1, array3);
                expect(result).toBe(true);
            });

            it("should return false if arrays do not match: [" + array1 + "], [" + array2 + "]", function () {
                var result = service.compareArrays(array1, array2);
                expect(result).toBe(false);
            });
        });
    });
});




