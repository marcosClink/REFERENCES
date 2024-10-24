const express = require('express');
const path = require('path');
const { permission } = require('process');
const { db, usersDb } = require('./db');
const {query1} = require('./queries');
const { Console } = require('console');
const { uploadFile , upload ,uploadDirectory} = require('./functions');

const app = express();


const PORT = process.env.PORT || 4000;

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parsing JSON bodies from requests

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public' ,'views', 'all_references.html'));
});

// Fetch all references from the database
app.get('/api/references', (req, res) => {
    const query = 'SELECT doc_unique, tran_num, tran_date, tran_sum, ref_num, ref_date, ref_sum FROM ref_doc ORDER BY tran_date DESC';

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving references:', err);
            return res.status(500).send("Error retrieving references");
        }
        res.json(rows); // Send the data as a JSON response
    });
});

app.get('/api/treat-references', (req, res) => {
    const query1 = 'SELECT doc_unique, tran_num, tran_date, tran_sum, ref_num, ref_date, ref_sum FROM ref_doc ORDER BY tran_date DESC';

    const query = `
    SELECT
        doc_unique,
        tran_num,
        tran_date,
        tran_sum,
        ref_num,
        ref_date,
        ref_sum
    FROM
        ref_doc 
    where
    ref_num = '' or ref_date ='' or ref_sum = ''
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
            tran_num,
            tran_date,
            tran_sum,
            ref_num,
            ref_date,
            ref_sum
        FROM ref_doc
        where 
        tran_date <= DATE('now', '-1 day') and (
            ref_num = '' or
            ref_sum = '' or
            ref_date = '' )
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


// Add a new reference to the database
app.post('/api/add-reference', upload.single('file_ref'), (req, res) => {
    const { tran_num, tran_date, tran_sum, ref_num, ref_date, ref_sum } = req.body;
    const file = req.file;
  
    // Insert into database and get the unique identifier
    const query = `INSERT INTO ref_doc (tran_num, tran_date, tran_sum, ref_num, ref_date, ref_sum)
                   VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.run(query, [tran_num, tran_date, tran_sum, ref_num, ref_date, ref_sum], function(err) {
      if (err) {
        console.error('Error inserting new reference:', err);
        return res.status(400).send('Error adding reference');
      }
  
    var docUnique = this.lastID;  // Assuming this gives the last inserted ID
      if(file)
        if(!uploadFile(file,docUnique,ref_num))  return res.status(500).send('File processing error');

      console.log(`Added reference with ID: ${docUnique}`);
      res.status(201).send('Reference added successfully');
    });
  });

app.put('/api/update-reference/:id',  upload.single('file_ref') ,(req, res) => {
    const { ref_num, ref_date, ref_sum } = req.body;
    const { id } = req.params;
    const file = req.file;

   const query = `UPDATE ref_doc 
                   SET ref_num = ?, ref_date = ?, ref_sum = ?
                   WHERE doc_unique = ?`;

    db.run(query, [ref_num, ref_date, ref_sum, id], function(err) {
        if (err) {
            console.error('Error updating reference:', err);
            return res.status(400).send("Error updating reference");
        }
        if(file)
            if(!uploadFile(file,id,ref_num))  return res.status(500).send('File processing error');


        if (this.changes === 0) {
            return res.status(404).send("Reference not found");
        }
        console.log(`Updated reference with ID: ${id}`);
        res.send("Reference updated successfully");
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

app.delete('/api/delete-trans/:id', (req, res) => {
    const { id } = req.params;

    db.run(`delete from ref_doc WHERE doc_unique = ?`,[id], function(err) {
        if (err) {
            console.error('Error deleting reference:', err);
            return res.status(400).send("Error deleting reference");
        }
        if (this.changes === 0) {
            res.status(400).send({ message: 'Reference not found' });
        }
        console.log(`deleted reference with ID: ${id}`);
        res.status(200).send({ message: 'deleted successfully' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Query the USERS database for the user's credentials
    usersDb.get('SELECT username, password, doc_references_permission FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }

        if (!row) {
            return res.status(404).send('User not found!');
        }

        // Compare the provided password with the stored hashed password
        const isValidPassword = password == row.password ;
        if (!isValidPassword) {
            return res.status(401).send('Invalid credentials!');
        }

        // Respond with success message if login is successful
        res.status(200).json({ message: 'success', username: row.username , permission:row.doc_references_permission});
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
