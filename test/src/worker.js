/* eslint-disable */

import { generateSudoku, formatSudoku } from './sudoku';

self.addEventListener('message', e => {
    let squaresToRemove = e.data;
    let grid = generateSudoku(squaresToRemove);
    self.postMessage(grid);
})