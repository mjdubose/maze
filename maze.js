/**
 * Created by Matthew on 11/30/2015.
 */

var _size;
var _grid;


function clicked() {

    _size = document.getElementById('size').value;
    if (_size == "") {
        return;
    }
    if (parseInt(_size) > 840) {
        return;
    }
    _size = parseInt(_size);
    _grid = new Array(_size * _size);

    InitializeWalls(_grid, _size);


    RenderWalls(_grid, _size);
    var builderList = [];
    var cells = [];
    InitializeCells(cells, _size);

    SetupCellNeighbors(cells, _size);

    var random = getRandomInt(0, _size);
   
    builderList.push(cells[random]);

    while (builderList.length > 0) {
        builderList = BuildMaze(builderList, _grid, random);
    }

    function Point(x, y) {
        this.X = x;
        this.Y = y;
    }

    function Cell(gridlocation) {
        this.GridLocation = gridlocation;
        //noinspection JSUnusedGlobalSymbols
        this.Visited = false;
        this.Top = null;
        this.Bottom = null;
        this.Left = null;
        this.Right = null;


    }

    function getRandomInt(min, max) {
        return  Math.floor(Math.random() * (max - min)) + min;

    }

    function GoingtopossibleList(mazeCell) {
        var goingtopossibleList = [];
        if (!mazeCell.Top.Visited) {
            goingtopossibleList.push(mazeCell.Top);

        }
        if (!mazeCell.Bottom.Visited) {
            goingtopossibleList.push(mazeCell.Bottom);

        }
        if (!mazeCell.Right.Visited) {
            goingtopossibleList.push(mazeCell.Right);


        }
        if (!mazeCell.Left.Visited) {

            goingtopossibleList.push(mazeCell.Left);

        }

        return goingtopossibleList;
    }

    function Draw(x, y) {
        var canvas = document.getElementById('drawingarea');
        var context = canvas.getContext("2d");
        context.fillStyle = "#FFF";
        context.fillRect(x, y, 1, 1);
    }

    function Removewall(mazeCell, whichway, grid) {


        if (mazeCell.GridLocation.X < whichway.GridLocation.X) {
            grid[((mazeCell.GridLocation.X + 1) * _size) + mazeCell.GridLocation.Y] = true;
            Draw(mazeCell.GridLocation.X + 1, mazeCell.GridLocation.Y);
        }

        if (mazeCell.GridLocation.X > whichway.GridLocation.X) {
            grid[((mazeCell.GridLocation.X - 1) * _size) + mazeCell.GridLocation.Y] = true;
            Draw(mazeCell.GridLocation.X - 1, mazeCell.GridLocation.Y);
        }
        if (mazeCell.GridLocation.Y < whichway.GridLocation.Y) {
            grid[(mazeCell.GridLocation.X * _size) + mazeCell.GridLocation.Y + 1] = true;
            Draw(mazeCell.GridLocation.X, mazeCell.GridLocation.Y + 1);
        }
        if (mazeCell.GridLocation.Y <= whichway.GridLocation.Y) {
            return;
        }

        grid[(mazeCell.GridLocation.X * _size) + mazeCell.GridLocation.Y - 1] = true;
        Draw(mazeCell.GridLocation.X, mazeCell.GridLocation.Y - 1);
    }


    function BuildMaze(mazeCell, grid) {

        var goingtopossibleList = GoingtopossibleList(mazeCell[mazeCell.length - 1]);

        if (mazeCell[mazeCell.length - 1].Visited && goingtopossibleList.length > 0) {
            var goingto = getRandomInt(0, goingtopossibleList.length - 1);

            Removewall(mazeCell[mazeCell.length - 1], goingtopossibleList[goingto], grid);
            mazeCell.push(goingtopossibleList[goingto]);
            return mazeCell;
        }

        RemoveCurrentPosition(mazeCell[mazeCell.length - 1], grid);
        mazeCell[mazeCell.length - 1].Visited = true;


        if (0 < goingtopossibleList.length) {
            var whichway = getRandomInt(0, goingtopossibleList.length);
            Removewall(mazeCell[mazeCell.length - 1], goingtopossibleList[whichway], grid);
            mazeCell.push(goingtopossibleList[whichway]);
            return mazeCell;
        }
        mazeCell.pop();
        return mazeCell;
    }


    function RemoveCurrentPosition(mazeCell, grid) {

        var x = mazeCell.GridLocation;


        grid[x.X * _size + x.Y] = true;
        Draw(mazeCell.GridLocation.X, mazeCell.GridLocation.Y);
    }


    function InitializeCells(cells, size) {
        for (var j = 0; j <= (size / 2) - 1; j++) {
            for (var i = 0; i <= (size / 2) - 1; i++) {
                cells.push(new Cell(new Point(i * 2 + 1, j * 2 + 1)));
            }
        }
    }

    function RenderWalls(grid, size) {
        var canvas = document.getElementById('drawingarea');
        var context = canvas.getContext("2d");
        context.fillStyle = "#000";

        var _size = size + 1;
        for (var count = 0; count < _size; count++) {
            for (var count1 = 0; count1 < _size; count1++) {
                if (!grid[count * _size + count1]) {
                    context.fillRect(count, count1, 1, 1);
                }
            }

        }
    }

    function SetupCellNeighbors(cells, size) {
        var width = size / 2;
        for (var j = 0; j <= width - 1; j++) {
            for (var i = 0; i <= width - 1; i++) {
                var linewidth = i * width;
                var workingOnThisOne = cells[linewidth + j];
                if (i == 0) {
                    workingOnThisOne.Top = cells[linewidth + j];
                }
                if (j == 0) {
                    workingOnThisOne.Left = cells[linewidth + j];
                }
                if (i == width - 1) {
                    workingOnThisOne.Bottom = cells[linewidth + j];
                }
                if (j == width - 1) {
                    workingOnThisOne.Right = cells[linewidth + j];
                }

                if (workingOnThisOne.Top == null) {
                    workingOnThisOne.Top = cells[(i - 1) * width + j];

                }
                if (workingOnThisOne.Bottom == null) {
                    workingOnThisOne.Bottom = cells[(i + 1) * width + j];

                }
                if (workingOnThisOne.Left == null) {
                    workingOnThisOne.Left = cells[linewidth + (j - 1)];

                }
                if (workingOnThisOne.Right == null) {
                    workingOnThisOne.Right = cells[linewidth + (j + 1)];

                }
            }
        }
    }

    function InitializeWalls(grid, size) {
        var _size = (size + 1) * (size + 1);
        for (var j = 0; j < _size + 1; j++) {
            grid[j] = false;
        }
    }
}