import Dexie from 'dexie';

const db = new Dexie('sudoku');
db.version(1).stores({
    unsolved: `++id,date,grid`
});

export default db;