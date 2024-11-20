// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join( './db/refDb.db'), (err) => {
    if (err) {
        console.error('Error opening clink_additions database: ' + err.message);
    } else {
        console.log('Connected to the clink_additions SQLite database.');
    }
});



const usersDb = new sqlite3.Database(path.join('./db/USERS.db'), (err) => {
    if (err) {
        console.error('Error opening USERS database: ' + err.message);
    } else {
        console.log('Connected to the USERS SQLite database.');
    }
});



module.exports = {
    db,
    usersDb
};
