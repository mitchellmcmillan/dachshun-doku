import deepCopy from './deep-copy';

function can_place(grid, row, column, n) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === n || grid[i][column] === n) {
            return false;
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[(row - row % 3) + i][(column - column % 3) + j] === n) {
                return false;
            }
        }
    }

    return true;
}

function is_complete(grid) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }

    return true;
}

function find_empty_square(grid) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] === 0) {
                return [i, j];
            }
        }
    }

    return null;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }

    return array;
}

function solve(grid) {
    if (is_complete(grid)) {
        return true;
    }

    let [row, column] = find_empty_square(grid);

    let mapping = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let pos = 0; pos < 9; pos++) {
        let digit = mapping[pos];

        if (can_place(grid, row, column, digit)) {
            grid[row][column] = digit;

            if (solve(grid)) {
                return grid;
            }

            grid[row][column] = 0;
        }
    }

    return null;
}

function has_unique_solution(grid) {
    let has_solution = false;

    // returns and propagates true if a second solution is encountered
    function check(grid) {
        if (is_complete(grid)) {
            if (has_solution) {
                return true;
            } else {
                has_solution = true;
                return false;
            }
        }

        let [row, column] = find_empty_square(grid);
        let mapping = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (let pos = 0; pos < 9; pos++) {
            let digit = mapping[pos];

            if (can_place(grid, row, column, digit)) {
                grid[row][column] = digit;

                if (check(grid)) {
                    return true;
                }

                grid[row][column] = 0;
            }
        }

        return false;
    }

    return !check(grid) && has_solution;
}

function emptyGrid(rows, columns) {
    return Array(rows).fill().map(() => Array(columns).fill(0));
}

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export function formatSudoku(sudoku) {
    let grid = toInternal(sudoku);
    return grid.map(row => row.map(c => c === 0 ? ' ' : c).join(" ")).join("\n");
}

export function generateSudoku(difficulty) {
    let grid = solve(emptyGrid(9, 9));

    let startTime = new Date();

    function timeElapsed() {
        return (new Date() - startTime) > 500;
    }

    for (let i = 0; i < difficulty; i++) {
        for (let counter = 0; counter < 10000 && !timeElapsed(); counter++) {
            let row, column;
            do {
                row = randomInt(9);
                column = randomInt(9);
            } while (grid[row][column] === 0 && !timeElapsed());

            let oldValue = grid[row][column];
            grid[row][column] = 0;
            if (has_unique_solution(deepCopy(grid))) {
                break;
            } else {
                grid[row][column] = oldValue;
            }
        }
    }

    return grid.map(row =>
        row.map(cell =>
            cell === 0
                ? { predefined: false, value: null }
                : { predefined: true, value: cell }));;
}

function toInternal(sudoku) {
    return sudoku.map(row => row.map(cell => cell.value || 0));
}

export function isComplete(sudoku) {
    let grid = toInternal(sudoku);

    if (!is_complete(grid)) {
        return false;
    }

    for (let row of grid) {
        for (let num = 1; num < 10; num++) {
            if (!row.includes(num)) {
                return false;
            }
        }
    }

    for (let col_idx = 0; col_idx < 9; col_idx++) {
        let col = grid.map(row => row[col_idx]);
        for (let num = 1; num < 10; num++) {
            if (!col.includes(num)) {
                return false;
            }
        }
    }

    for (let xRegion = 0; xRegion < 3; xRegion++) {
        for (let yRegion = 0; yRegion < 3; yRegion++) {

            let region = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    region.push(grid[3 * xRegion + i][3 * yRegion + j]);
                }
            }

            for (let num = 1; num < 10; num++) {
                if (!region.includes(num)) {
                    return false;
                }
            }
        }
    }

    return true;
}