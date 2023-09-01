const mysql = require('mysql2/promise');
const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
app.use(cors());

// UPDATE `counter` SET `count`=0;
// DELETE FROM `events`;
// DELETE FROM `responses`;

//serving static files
app.use(express.static('public'));

//middleware that parses req.body into JSON
app.use(express.json());

//load environment variables from .env
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: '30days',
    connectionLimit: 10
});

//____________________respond/uniqueLink____________________________
  //hosting dynamic.html using route parameters

app.get('/respond/:link', async (req, res) => {
    try {
        const linkValue = req.params.link;
        const sql = 'SELECT hours FROM events WHERE link = ?';
        const [result, fields] = await pool.query(sql, [linkValue]);
  
        if (result.length === 0) {
        return res.status(404).send('Link not found.');
        }
        console.log(result);

        fs.readFile('dynamic.html', 'utf-8', async (err, html) => {
            if (err) {
                res.status(500).send('Error reading HTML file');
                return;
            }
            const processedHTML = html.replace('{{ dynamicData }}', JSON.stringify(result));
            console.log('result json: ' + JSON.stringify(result));

            res.send(processedHTML);
        });
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

//____________________result/uniqueLink____________________________
  //hosting the result.html

app.get('/result/:link', async (req, res) => {
    try {
        const linkValue = req.params.link;
        const sql = 'SELECT day,name FROM responses WHERE link = ?';
        const [result, fields] = await pool.query(sql, [linkValue]);
        
        const sql2 = 'SELECT hours FROM events WHERE link = ?';
        const [result2, fields2] = await pool.query(sql2, [linkValue]);
  
        if (result.length === 0) {
          return res.status(404).send('Link not found.');
        }
        console.log(result);

        fs.readFile('result.html', 'utf-8', async (err, html) => {
        if (err) {
            res.status(500).send('Error reading HTML file');
            return;
        }
        const processedHTML = html.replace('{{ dynamicData }}', JSON.stringify(result)).replace('{{ dynamicData2 }}',JSON.stringify(result2));
        console.log('result json: ' + JSON.stringify(result));

        res.send(processedHTML);
    });
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  });

//______________________index.html____________________________

// retrieving the current counter
app.get('/retrieveCounter', async (req, res) => {
    try {
        const sql = 'SELECT count FROM counter';

        const [results] = await pool.query(sql);

        const data = results[0].count;
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while retrieving data.' });
    }
});

//incrementing counter
app.post('/incrementCounter', async (req, res) => {
    try {
        const sql = 'UPDATE counter SET count = count + 1';
        const [result, fields] = await pool.query(sql);
        
        if (result.affectedRows === 1) {
          console.log('Counter incremented successfully.');
          res.status(200).json({ message: 'Counter incremented successfully.' });
        } else {
          console.error('Counter update did not affect any rows.');
          res.status(500).json({ error: 'Counter update failed.' });
        }
    } catch (error) {
      console.error('Error incrementing counter:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  });
  

//saving good days to database
app.post('/savingGoodDays', async (req, res) => {
    try {
        const payload = req.body;
        const hours = payload.hours;

        const values = hours.map(hour => [payload.link, hour]);
        console.log('values: ' + values);

        const sql = "INSERT INTO events (link, hours) VALUES ?";
        const [result, fields] = await pool.query(sql, [values]);

        if (result.affectedRows > 0) {
          console.log('Data inserted successfully.');
          res.status(200).json({ message: 'Data inserted successfully.' });
        } else {
          console.error('Error inserting data.');
          res.status(500).json({ error: 'An unexpected error occurred while inserting data.' });
        }
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// ______________________dynamic.html____________________________

app.post('/savingResponse', async (req, res) => {
    try {
        const payload = req.body;
        console.log('payload.day: ' + payload.day);
        const day = payload.day;
        const values = day.map(value => [payload.link, value, payload.name]);
        
        const sql = "INSERT INTO responses (link, day, name) VALUES ?";
        const [result, fields] = await pool.query(sql, [values]);
        
        if (result.affectedRows > 0) {
          console.log('Data inserted successfully.');
          res.status(200).json({ message: 'Data inserted successfully.' });
        } else {
          console.error('Error inserting data.');
          res.status(500).json({ error: 'An unexpected error occurred while inserting data.' });
        }
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  });

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});