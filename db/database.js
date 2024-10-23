const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open a connection to the SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'clink_additions.db'), (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;
