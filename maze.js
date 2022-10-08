/**
 * Created by Matthew on 11/30/2015.
 */
let _size;
const context = document.getElementById('drawingarea').getContext("2d");

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

const renderWalls = (grid, size) => {
    context.fillStyle = "#000";
    const _size = size + 1;
    for (let x = 0; x < _size; x++) {
        for (let y = 0; y < _size; y++) {
            if (!grid[x * _size + y]) {
                context.fillRect(x, y, 1, 1);
            }
        }
    }
};

const initializeCells = (cells, size) => {
    for (let j = 0; j <= (size / 2) - 1; j++) {
        for (let i = 0; i <= (size / 2) - 1; i++) {
            cells.push(new Cell(new Point(i * 2 + 1, j * 2 + 1)));
        }
    }
};

const removeCurrentPositionOnCanvas = (mazeCell, grid) => {
    //get current grid item, figure out where it's drawn
    const x = mazeCell.GridLocation;
    grid[x.X * _size + x.Y] = true;
    //change the pixel colors;
    Draw(x.X, x.Y);
};

const buildMaze = (mazeCell, grid) => {
    //get a list of unvisited directions (Top, Bottom, Left,Right)
    const directionList = getDirectionList(mazeCell[mazeCell.length - 1]);

    // if we haven't been here before, remove the color on the map, set the value to visited
    if (!mazeCell[mazeCell.length - 1].Visited) {
        removeCurrentPositionOnCanvas(mazeCell[mazeCell.length - 1], grid);
        mazeCell[mazeCell.length - 1].Visited = true;
    }

    // and move to the direction to which we haven't visited
    if (0 < directionList.length) {
        moveInDirection(directionList, mazeCell, grid);
        return;
    }
    // we've been everywhere, remove this array from the list of places to visit
    mazeCell.pop();

};

const clicked = () => {
    _size = document.getElementById('size').value;
    if (_size === "" || _size * 1 > 840) {
        return;
    }

    const _grid = new Array(_size * _size);
    const cells = [];
    const random = getRandomInt(0, _size);
    renderWalls(_grid, _size);
    initializeCells(cells, _size);
    setupCellNeighbors(cells, _size);
    const builderList = [cells[random]];
    while (builderList.length > 0) {
        buildMaze(builderList, _grid, getRandomInt(0, _size));
    }
};

const removeWall = (mazeCell, direction, grid) => {
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

const moveInDirection = (directionList, mazeCell, grid) => {
    const direction = getRandomInt(0, directionList.length);
    removeWall(mazeCell[mazeCell.length - 1], directionList[direction], grid);
    mazeCell.push(directionList[direction]);
};

const getDirectionList = (mazeCell) => {
    return Object.keys(mazeCell).reduce((acc, item) => {
        if (!(item === 'GridLocation' || item === 'Visited')) {
            if (!mazeCell[item].Visited) {
                acc.push(mazeCell[item]);
            }
        }
        return acc;
    }, [])
};

const Draw = (x, y) => {
    context.fillStyle = "#FFF";
    context.fillRect(x, y, 1, 1);
};

const Cell = function (gridLocation) {
    return {
        GridLocation: gridLocation,
        Visited: false,
        Top: null,
        Bottom: null,
        Left: null,
        Right: null
    };
};
const Point = function (x, y) {
    this.X = x;
    this.Y = y;
};


const setupCellNeighbors = (cells, size) => {
    const width = size / 2;
    let lineWidth;
    let targetCell;
    for (let j = 0; j <= width - 1; j++) {
        for (let i = 0; i <= width - 1; i++) {
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