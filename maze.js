/**
 * Created by Matthew on 11/30/2015.
 */

const context = document.getElementById('drawingarea').getContext("2d");

const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);


const clicked = () => {
    let _size = document.getElementById('size').value;
    if (_size === "" || _size * 1 > 840) {
        return;
    }
    _size = parseInt(_size);
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


    const renderWalls = (size) => {
        const WALL_SIZE = 1;
        const grid = new Array(size * size);
        context.fillStyle = "#000";
        const gridSize = size + 1;

        const isEmptyCell = (index) => !grid[index];

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (isEmptyCell(x * gridSize + y)) {
                    context.fillRect(x, y, WALL_SIZE, WALL_SIZE);
                }
            }
        }

        return grid;
    };

    const setupCellNeighbors = (size) => {
        return (cells) => {
            const halfSize = size / 2;

            const assignNeighbor = (currentCell, direction, value) => {
                if (currentCell[direction] == null) {
                    currentCell[direction] = value;
                }
            };

            for (let j = 0; j < halfSize; j++) {
                for (let i = 0; i < halfSize; i++) {
                    const cellIndexMultiplier = i * halfSize;
                    const currentCell = cells[cellIndexMultiplier + j];

                    if (i === 0) {
                        currentCell.Top = cells[cellIndexMultiplier + j];
                    }
                    if (j === 0) {
                        currentCell.Left = cells[cellIndexMultiplier + j];
                    }
                    if (i === halfSize - 1) {
                        currentCell.Bottom = cells[cellIndexMultiplier + j];
                    }
                    if (j === halfSize - 1) {
                        currentCell.Right = cells[cellIndexMultiplier + j];
                    }

                    assignNeighbor(currentCell, 'Top', cells[(i - 1) * halfSize + j]);
                    assignNeighbor(currentCell, 'Bottom', cells[(i + 1) * halfSize + j]);
                    assignNeighbor(currentCell, 'Left', cells[cellIndexMultiplier + (j - 1)]);
                    assignNeighbor(currentCell, 'Right', cells[cellIndexMultiplier + (j + 1)]);
                }
            }

            return cells;
        }
    };

    const setUpCellNeighborsCells = setupCellNeighbors(_size);

    const modifyGrid = (grid, x, y) => {
        grid[x * _size + y] = true;
        Draw(x, y);
    };

    const removeWall = (mazeCell, direction, grid) => {
        const {X, Y} = mazeCell.GridLocation;
        const {GridLocation} = direction;

        if (X < GridLocation.X) {
            modifyGrid(grid, X + 1, Y);
        } else if (X > GridLocation.X) {
            modifyGrid(grid, X - 1, Y);
        }

        if (Y < GridLocation.Y) {
            modifyGrid(grid, X, Y + 1);
        } else if (Y > GridLocation.Y) {
            modifyGrid(grid, X, Y - 1);
        }
    };
    const moveInDirection = (directionList, mazeCell, grid) => {
        //out of the list of directions
        const direction = getRandomInt(0, directionList.length);
        //pick one and remove the wall in that direction
        removeWall(mazeCell[mazeCell.length - 1], directionList[direction], grid);
        //on next iteration this is the spot we're starting from;
        mazeCell.push(directionList[direction]);
    };
    const getDirectionList = (mazeCell) => {
        return Object.keys(mazeCell).reduce((acc, item) => {
            if (!(item === 'GridLocation' || item === 'Visited')) {

                // for each of the directions, if we haven't been that way yet
                if (!mazeCell[item].Visited) {
                    // add that direction;
                    acc.push(mazeCell[item]);
                }
            }
            return acc;
        }, []);
    };
    const Draw = (x, y) => {
        context.fillStyle = "#FFF";
        context.fillRect(x, y, 1, 1);
    };

    const removeCurrentPosition = (mazeCell, grid) => {
        const x = mazeCell.GridLocation;
        grid[x.X * _size + x.Y] = true;
        Draw(x.X, x.Y);
    };

    const generateCells = (size) => {
        const cells = [];
        const halfSize = size / 2;
        const limit = halfSize - 1;

        for (let j = 0; j <= limit; j++) {
            for (let i = 0; i <= limit; i++) {
                cells.push(new Cell(new Point(i * 2 + 1, j * 2 + 1)));
            }
        }

        return cells;
    };

    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    // Function to handle the unvisited maze cell
    const handleUnvisitedCell = (mazeCell, grid) => {
        if (!mazeCell.Visited) {
            removeCurrentPosition(mazeCell, grid);
            mazeCell.Visited = true;
        }
    };

//Function to move to an unvisited direction
    const moveToUnvisitedDirection = (directionList, mazeCell, grid) => {
        if (directionList.length > 0) {
            moveInDirection(directionList, mazeCell, grid);
        } else {
            //we've been everywhere, remove this array from the list of places to visit
            mazeCell.pop();
        }
    };

    const buildMazeWithGrid = (grid) => {
        return (mazeCell) => {
            const latestMazeCell = mazeCell[mazeCell.length - 1];
            const directionList = getDirectionList(latestMazeCell);

            handleUnvisitedCell(latestMazeCell, grid);
            moveToUnvisitedDirection(directionList, mazeCell, grid);
        }
    };


    const buildMaze = compose(buildMazeWithGrid, renderWalls)(_size);

    const cells = compose(setUpCellNeighborsCells, generateCells)(_size);
    const builderList = [cells[getRandomInt(0, _size)]];
    while (builderList.length > 0) {
        buildMaze(builderList);
    }

};







