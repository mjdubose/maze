/**
 * Created by Matthew on 11/30/2015.
 */

var _size;
var context = document.getElementById('drawingarea').getContext("2d");

var clicked = function () {
    _size = document.getElementById('size').value;
    if (_size === "") {
        return;
    }
    _size = parseInt(_size);
    if (_size > 840) {
        return;
    }

    var _grid = new Array(_size * _size);
    var builderList = [];
    var cells = [];
    var random = getRandomInt(0, _size);
    renderWalls(_grid, _size);
    initializeCells(cells, _size);
    setupCellNeighbors(cells, _size);
    builderList.push(cells[random]);
    while (builderList.length > 0) {
        builderList = buildMaze(builderList, _grid, getRandomInt(0, _size));
    }
};

var moveInDirection = function (directionList, mazeCell, grid) {
    var direction = getRandomInt(0, directionList.length);
    removeWall(mazeCell[mazeCell.length - 1], directionList[direction], grid);
    mazeCell.push(directionList[direction]);
    return mazeCell;
};

var buildMaze = function (mazeCell, grid) {
    var directionList = getDirectionList(mazeCell[mazeCell.length - 1]);
    if (mazeCell[mazeCell.length - 1].Visited && directionList.length > 0) {
        return moveInDirection(directionList, mazeCell, grid);
    }
    removeCurrentPosition(mazeCell[mazeCell.length - 1], grid);
    mazeCell[mazeCell.length - 1].Visited = true;
    if (0 < directionList.length) {
        return moveInDirection(directionList, mazeCell, grid);
    }
    mazeCell.pop();
    return mazeCell;
};

var removeCurrentPosition = function (mazeCell, grid) {
    var x = mazeCell.GridLocation;
    grid[x.X * _size + x.Y] = true;
    Draw(x.X, x.Y);
};

var initializeCells = function (cells, size) {
    for (var j = 0; j <= (size / 2) - 1; j++) {
        for (var i = 0; i <= (size / 2) - 1; i++) {
            cells.push(new Cell(new Point(i * 2 + 1, j * 2 + 1)));
        }
    }
};

var removeWall = function (mazeCell, direction, grid) {
    if (mazeCell.GridLocation.X < direction.GridLocation.X) {
        grid[((mazeCell.GridLocation.X + 1) * _size) + mazeCell.GridLocation.Y] = true;
        Draw(mazeCell.GridLocation.X + 1, mazeCell.GridLocation.Y);
    }
    if (mazeCell.GridLocation.X > direction.GridLocation.X) {
        grid[((mazeCell.GridLocation.X - 1) * _size) + mazeCell.GridLocation.Y] = true;
        Draw(mazeCell.GridLocation.X - 1, mazeCell.GridLocation.Y);
    }
    if (mazeCell.GridLocation.Y < direction.GridLocation.Y) {
        grid[(mazeCell.GridLocation.X * _size) + mazeCell.GridLocation.Y + 1] = true;
        Draw(mazeCell.GridLocation.X, mazeCell.GridLocation.Y + 1);
    }
    if (mazeCell.GridLocation.Y <= direction.GridLocation.Y) {
        return;
    }
    grid[(mazeCell.GridLocation.X * _size) + mazeCell.GridLocation.Y - 1] = true;
    Draw(mazeCell.GridLocation.X, mazeCell.GridLocation.Y - 1);
};

var getDirectionList = function (mazeCell) {
    var directionList = [];
    for (var prop in mazeCell) {
        if (!(prop === 'GridLocation' || prop === 'Visited') && !mazeCell[prop].Visited) {
            directionList.push(mazeCell[prop]);
        }
    }
    return directionList;
};

var Draw = function (x, y) {
    context.fillStyle = "#FFF";
    context.fillRect(x, y, 1, 1);
};

var renderWalls = function (grid, size) {
    context.fillStyle = "#000";
    var _size = size + 1;
    for (var x = 0; x < _size; x++) {
        for (var y = 0; y < _size; y++) {
            if (!grid[x * _size + y]) {
                context.fillRect(x, y, 1, 1);
            }
        }
    }
};

var Point = function (x, y) {
    this.X = x;
    this.Y = y;
};

var Cell = function (gridLocation) {
    return {
        GridLocation: gridLocation,
        Visited: false,
        Top: null,
        Bottom: null,
        Left: null,
        Right: null
    };
};

var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

var setupCellNeighbors = function (cells, size) {
    var width = size / 2;
    var lineWidth;
    var targetCell;
    for (var j = 0; j <= width - 1; j++) {
        for (var i = 0; i <= width - 1; i++) {
         lineWidth = i * width;
         targetCell = cells[lineWidth + j];
            if (i === 0) {
                targetCell.Top = cells[lineWidth + j];
            }
            if (j === 0) {
                targetCell.Left = cells[lineWidth + j];
            }
            if (i === width - 1) {
                targetCell.Bottom = cells[lineWidth + j];
            }
            if (j === width - 1) {
                targetCell.Right = cells[lineWidth + j];
            }
            if (targetCell.Top == null) {
                targetCell.Top = cells[(i - 1) * width + j];
            }
            if (targetCell.Bottom == null) {
                targetCell.Bottom = cells[(i + 1) * width + j];
            }
            if (targetCell.Left == null) {
                targetCell.Left = cells[lineWidth + (j - 1)];
            }
            if (targetCell.Right == null) {
                targetCell.Right = cells[lineWidth + (j + 1)];
            }
        }
    }
};