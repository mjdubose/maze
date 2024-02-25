/**
 * Represents the canvas element used for drawing.
 *
 * @type {HTMLElement}
 * @name canvasElement
 * @memberOf window
 */

const canvasElement = document.getElementById('drawingarea');
/**
 * Represents the context of a 2D canvas element.
 *
 * @type {CanvasRenderingContext2D|null}
 */
const context = canvasElement ? canvasElement.getContext("2d") : null;

/**
 * Compose higher-order function.
 *
 * This function takes any number of functions as arguments and returns
 * a new function that applies the composed functions in right-to-left order.
 *
 * @param {...Function} fns - The functions to be composed.
 * @returns {Function} The composed function.
 */
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);


/**
 * Represents a function that generates a maze based on user input size.
 *
 * @function clicked
 */
const clicked = () => {
    let _size = document.getElementById('size').value;
    if (_size === "" || _size * 1 > 840) {
        return;
    }
    _size = parseInt(_size);
    /**
     * Represents a cell in a grid.
     * @constructor
     * @param {Object} gridLocation - The location of the cell in the grid.
     * @property {Object} GridLocation - The location of the cell in the grid.
     * @property {boolean} Visited - Indicates whether the cell has been visited or not.
     * @property {Object|null} Top - The cell located above this cell.
     * @property {Object|null} Bottom - The cell located below this cell.
     * @property {Object|null} Left - The cell located to the left of this cell.
     * @property {Object|null} Right - The cell located to the right of this cell.
     */
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

    /**
     * Represents a point in a 2D coordinate system.
     * @constructor
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     */
    const Point = function (x, y) {
        this.X = x;
        this.Y = y;
    };


    /**
     * Renders the walls on a grid.
     *
     * @param {number} size - The size of the grid.
     * @returns {Array} - The grid with walls rendered.
     */
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

    /**
     * Assigns neighbors to each cell in a grid based on the given size.
     * @param {number} size - The size of the grid (should be an even number).
     * @returns {Function} A function that takes an array of cells as input and assigns neighbors to each cell.
     */
    const setupCellNeighbors = (size) => {
        return (cells) => {
            const halfSize = size / 2;

            const assignNeighbor = (currentCell, direction, value) => {
                if (currentCell[direction] == null) {
                    currentCell[direction] = value;
                }
            };

            for (let y = 0; y < halfSize; y++) {
                for (let x = 0; x < halfSize; x++) {
                    const cellIndexMultiplier = x * halfSize + y;
                    const currentCell = cells[cellIndexMultiplier ];

                    if (x === 0) {
                        currentCell.Top = cells[cellIndexMultiplier];
                    }
                    if (y === 0) {
                        currentCell.Left = cells[cellIndexMultiplier ];
                    }
                    if (x === halfSize - 1) {
                        currentCell.Bottom = cells[cellIndexMultiplier];
                    }
                    if (y === halfSize - 1) {
                        currentCell.Right = cells[cellIndexMultiplier];
                    }

                    assignNeighbor(currentCell, 'Top', cells[(x - 1) * halfSize + y]);
                    assignNeighbor(currentCell, 'Bottom', cells[(x + 1) * halfSize + y]);
                    assignNeighbor(currentCell, 'Left', cells[cellIndexMultiplier  - 1]);
                    assignNeighbor(currentCell, 'Right', cells[cellIndexMultiplier  + 1]);
                }
            }

            return cells;
        }
    };

    const setUpCellNeighborsCells = setupCellNeighbors(_size);

    /**
     * Modifies the grid by setting the element at the given position to true and triggering a draw event.
     *
     * @param {boolean[]} grid - The grid to be modified.
     * @param {number} x - The x-coordinate of the position to modify.
     * @param {number} y - The y-coordinate of the position to modify.
     */
    const modifyGrid = (grid, x, y) => {
        grid[x * _size + y] = true;
        Draw(x, y);
    };

    /**
     * Removes a wall between two maze cells based on the given direction.
     *
     * @param {Object} mazeCell - The maze cell object.
     * @param {Object} direction - The direction object representing the neighboring maze cell.
     * @param {Array} grid - The maze grid array.
     */
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
    /**
     * Moves the current maze cell in a random direction.
     *
     * @param {Array} possibleDirections - An array of possible directions to move in.
     * @param {Array} mazeCell - The current maze cell.
     * @param {Array} grid - The grid representing the maze.
     *
     * @returns {void}
     */
    const moveInDirection = (possibleDirections, mazeCell, grid) => {
        const selectedDirectionIndex = getRandomInt(0, possibleDirections.length);
        const nextMazeCell = possibleDirections[selectedDirectionIndex];

        removeWall(mazeCell[mazeCell.length - 1], nextMazeCell, grid);

        // Add selected direction to the maze cell for subsequent movement.
        mazeCell.push(nextMazeCell);
    };
    const FILTER_KEYS = ['GridLocation', 'Visited'];

    /**
     * Determines if a direction is unvisited in a maze cell.
     *
     * @param {Object} mazeCell - The maze cell object.
     * @param {string} key - The direction key ('north', 'east', 'south', or 'west').
     * @returns {boolean} Returns `true` if the direction is unvisited, `false` otherwise.
     */
    const isUnvisitedDirection = (mazeCell, key) => {
        return !FILTER_KEYS.includes(key) && !mazeCell[key].Visited;
    };

    /**
     * Retrieves the list of unvisited neighboring directions in a maze cell.
     *
     * @param {Object} mazeCell - The maze cell object.
     * @returns {Array} - The list of unvisited neighboring directions.
     */
    const getDirectionList = (mazeCell) => {
        return Object.keys(mazeCell).reduce((acc, key) => {
            if (isUnvisitedDirection(mazeCell, key)) {
                acc.push(mazeCell[key]);
            }
            return acc;
        }, []);
    };
    /**
     * Draws a point on the canvas at the given coordinates.
     *
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     */
    const Draw = (x, y) => {
        context.fillStyle = "#FFF";
        context.fillRect(x, y, 1, 1);
    };

    /**
     * Removes the current position from the maze grid.
     *
     * @param {Object} mazeCell - The current maze cell.
     * @param {Array} grid - The maze grid.
     */
    const removeCurrentPosition = (mazeCell, grid) => {
        const x = mazeCell.GridLocation;
        grid[x.X * _size + x.Y] = true;
        Draw(x.X, x.Y);
    };

    /**
     * Creates a new instance of Point with the provided coordinates.
     *
     * @param {number} i - The x-coordinate value.
     * @param {number} j - The y-coordinate value.
     * @returns {Point} - A new Point object with the given coordinates.
     */
    const getCoords = (i, j) => new Point(i * 2 + 1, j * 2 + 1);

    /**
     * Generates an array of Cell objects based on the given size.
     *
     * @param {number} size - The size of the grid (number of rows/columns).
     * @returns {Array} - An array of Cell objects.
     */
    const generateCells = (size) => {
        const cells = [];
        const gridBound = size / 2 - 1;
        for (let j = 0; j <= gridBound; j++) {
            for (let i = 0; i <= gridBound; i++) {
                const coordinates = getCoords(i, j);
                cells.push(new Cell(coordinates));
            }
        }
        return cells;
    };

    /**
     * Generates a random integer between the provided minimum and maximum values.
     *
     * @param {number} min - The minimum value of the range (inclusive).
     * @param {number} max - The maximum value of the range (exclusive).
     * @returns {number} - The random integer generated within the specified range.
     */
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    // Function to handle the unvisited maze cell
    /**
     * Handles an unvisited maze cell.
     *
     * @param {MazeCell} mazeCell - The maze cell to handle.
     * @param {Grid} grid - The maze grid.
     * @returns {void}
     */
    const handleUnvisitedCell = (mazeCell, grid) => {
        if (!mazeCell.Visited) {
            removeCurrentPosition(mazeCell, grid);
            mazeCell.Visited = true;
        }
    };



    /**
     * Builds a maze with a given grid.
     *
     * @param {Array<Array<any>>} grid - The grid representing the maze.
     * @returns {Function} - A function responsible for building the maze cell by cell.
     */
    const buildMazeWithGrid = (grid) => {
        return (mazeCell) => {
            const latestMazeCell = mazeCell[mazeCell.length - 1];
            const directionList = getDirectionList(latestMazeCell);

            handleUnvisitedCell(latestMazeCell, grid);
            directionList.length ? moveInDirection(directionList, mazeCell, grid) : mazeCell.pop();
        }
    };

    if (context) {

        const buildMaze = compose(buildMazeWithGrid, renderWalls)(_size);

        const cells = compose(setUpCellNeighborsCells, generateCells)(_size);
        const builderList = [cells[getRandomInt(0, _size)]];
        while (builderList.length > 0) {
            buildMaze(builderList);
        }
    }

};







