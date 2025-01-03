const express = require('express');
//const { Console } = require('console');
const { db, usersDb } = require('./db');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { permission } = require('process');
const { uploadFile, upload, uploadDirectory, checkFileExists, generateHtmlContent } = require('./functions');
const sendEmail = require('./emailSender');
//const { console } = require('inspector');

const maxSum = 25000;


/*const limiter = rateLimit({
    windowMs: 15 * 60 * 100, // 15 sec
    max: 100 // limit each IP to 100 requests per windowMs//
});*/

const app = express();

//app.use(limiter);
const PORT = process.env.PORT || 4000;



// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parsing JSON bodies from requests

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'all_references.html'));
});

// Fetch all references from the database
app.get('/api/references', (req, res) => {
    const query = 'SELECT doc_unique, id_buyer, tran_num, tran_date, tran_sum, id_seller, ref_num, ref_date, ref_sum FROM ref_doc ORDER BY tran_date DESC';

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving references:', err);
            return res.status(500).send("Error retrieving references");
        }
        res.json(rows); // Send the data as a JSON response
    });
});

app.get('/api/treat-references', (req, res) => {
    const query = `
    SELECT
        doc_unique,
        id_buyer,
        tran_num,
        tran_date,
        tran_sum,
        id_seller,
        ref_num,
        ref_date,
        ref_sum
    FROM
        ref_doc 
    where
    ref_num = '' or ref_date ='' or ref_sum = '' or id_seller =''
    ORDER BY
        tran_date DESC
`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving references:', err);
            return res.status(500).send("Error retrieving references");
        }
        res.json(rows); // Send the data as a JSON response
    });
});

app.get('/api/late-references', (req, res) => {
    const query = `
        SELECT
            doc_unique,
            id_buyer,
            tran_num,
            tran_date,
            tran_sum,
            id_seller,
            ref_num,
            ref_date,
            ref_sum
        FROM ref_doc
        where 
        tran_date <= DATE('now', '-1 day') and (
            ref_num = '' or
            ref_sum = '' or
            ref_date = '' or
            id_seller = '')
        ORDER BY tran_date DESC;
`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving references:', err);
            return res.status(500).send("Error retrieving references");
        }
        res.json(rows); // Send the data as a JSON response
    });
});
app.post('/api/date-range', (req, res) => {
    const { start, end, select } = req.body;

    // Validate the column name
    const allowedColumns = ["tran_date", "ref_date"]; // Example of allowed columns
    if (!allowedColumns.includes(select)) {
        return res.status(400).send("Invalid column name for 'select'");
    }

    // Dynamically construct the query
    const query = `
        SELECT
            id_buyer,
            tran_num,
            tran_date,
            tran_sum,
            id_seller,
            ref_num,
            ref_date,
            ref_sum
        FROM ref_doc
        WHERE ${select} >= ? AND ${select} <= ?
        ORDER BY ${select} DESC;
    `;

    // Execute the query
    db.all(query, [start, end], (err, rows) => {
        if (err) {
            console.error("Error retrieving references:", err);
            return res.status(500).send("Error retrieving references");
        }
        res.json(rows); // Send the data as a JSON response
    });
});


// Add a new reference to the database
app.post('/api/add-reference', upload.single('file_ref'), (req, res) => {
    const { id_buyer, tran_num, tran_date, tran_sum, id_seller, ref_num, ref_date, ref_sum } = req.body;
    const file = req.file;

    // Insert into database and get the unique identifier
    const query = `INSERT INTO ref_doc (id_buyer, tran_num, tran_date, tran_sum, id_seller, ref_num, ref_date, ref_sum)
                   VALUES (?, ?, ?, ?, ?, ?,?,?)`;
    const query1 = `select id_buyer as user_id , count(tran_num) as deals_num ,sum(tran_sum) as deals_sum from ref_doc where id_buyer=? 
    group by id_buyer having  sum(tran_sum) >= ?`;

    db.run(query, [id_buyer, tran_num, tran_date, tran_sum, id_seller, ref_num, ref_date, ref_sum], function (err) {
        if (err) {
            console.error('Error inserting new reference:', err);
            return res.status(400).send('Error adding reference');
        }

        var docUnique = this.lastID;  // Assuming this gives the last inserted ID
        if (file)
            if (!uploadFile(file, docUnique, ref_num)) return res.status(500).send('File processing error');

        console.log(`Added reference with ID: ${docUnique}`);
    });

    db.all(query1, [id_buyer, maxSum], function (err, rows) {
        if (err) {
            console.error('Error updating reference:', err);
            return res.status(400).send("Error updating reference");
        }
        if (rows.length != 0) {
            const htmlContent = generateHtmlContent(rows);
            sendEmail(
                process.env.EMAIL_SEND_TO,
                //'marcosspinto18@gmail.com',
                'עדכון עבור חריגים חדשים לטיפול',
                'עדכון חריגים',
                htmlContent
            );
        }
    });

    res.status(201).send('Reference added successfully');
});

app.put('/api/update-reference/:id', upload.single('file_ref'), (req, res) => {
    const { id_seller, ref_num, ref_date, ref_sum } = req.body;
    const { id } = req.params;
    const file = req.file;

    const query = `UPDATE ref_doc 
                   SET id_seller = ?,ref_num = ?, ref_date = ?, ref_sum = ? 
                   WHERE doc_unique = ?`;

    db.run(query, [id_seller, ref_num, ref_date, ref_sum, id], function (err) {
        if (err) {
            console.error('Error updating reference:', err);
            return res.status(400).send("Error updating reference");
        }
        if (file)
            if (!uploadFile(file, id, ref_num)) return res.status(500).send('File processing error');


        if (this.changes === 0) {
            return res.status(404).send("Reference not found");
        }
        console.log(`Updated reference with ID: ${id}`);
        res.send("Reference updated successfully");
    });
});

app.get('/api/exceptionals', (req, res) => {

    const query = `select doc_unique, id_buyer, tran_num, tran_date, tran_sum, id_seller, ref_num, ref_date, ref_sum
    from ref_doc
    where  id_buyer in (
    select id_buyer 
    from ref_doc 
    group by id_buyer 
    having  sum(tran_sum) >= ?)
    order by id_buyer`;

    db.all(query, [maxSum], function (err, rows) {
        if (err) {
            console.error('Error updating reference:', err);
            return res.status(400).send("Error updating reference");
        }

        res.status(200).json(rows); // Send the data as a JSON response
    });

});

// Serve files directly from this folder
app.use('/files', express.static(uploadDirectory));

// Optional: Serve a download route with specific headers
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDirectory, filename);

    // Serve the file with a downloaded header
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('File download error:', err);
            res.status(500).send('Error downloading file.');
        }
    });

});


app.get('/api/check-file/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDirectory, filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.json({ haveFile: false }); // Send response and exit
        }

        // File exists
        res.json({ haveFile: true }); // Send response
    });
});

app.delete('/api/delete-trans/:id', async (req, res) => {
    const { id } = req.params; // Get the transaction ID from the URL
    const { filename } = req.body; // Get the filename from the request body

    console.log("Received request to delete transaction with ID:", id);
    console.log("Filename to delete:", filename);

    const filePath = path.join(uploadDirectory, filename);

    db.run(`delete from ref_doc WHERE doc_unique = ?`, [id], function (err) {
        if (err) {
            console.error('Error deleting reference:', err);
            return res.status(400).send("Error deleting reference");
        }
        if (this.changes === 0) {
            return res.status(400).send({ message: 'Reference not found' });
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log("no file");
            }
            else {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                    console.log('File deleted successfully:', filePath);
                });
            }

        });

        console.log(`deleted reference with ID: ${id}`);
        return res.status(200).send({ message: 'deleted successfully' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Query the USERS database for the user's credentials
    usersDb.get('SELECT username, password, doc_references_permission, name_worker FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }

        if (!row) {
            return res.status(200).json({ message: 'User not found!' });
        }

        // Compare the provided password with the stored hashed password
        const isValidPassword = password == row.password;
        if (!isValidPassword) {
            return res.status(200).json({ message: 'Invalid credentials!' });
        }

        // Respond with success message if login is successful
        res.status(200).json({ message: 'success', workername: row.name_worker, permission: row.doc_references_permission });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




