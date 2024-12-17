const db = require('../db');

exports.addAitools = (req, res) => {
    const { name, description, url, image } = req.body;

    const query = 'INSERT INTO aitools (name, description, url, image) VALUES (?, ?, ?, ?)';
    db.query(query, [name, description, url, image], (err, result) => {
        if (err) {
            console.error('Error adding AiTool:', err);
            return res.status(500).send('Failed to AiTool');
        }
        res.send('Ai Tool added successfully!');
    });
};


exports.dashboardTools = (req, res) => {
    const query = 'SELECT * FROM aitools ORDER BY id DESC LIMIT 6';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching AI tools:', err);
            res.status(500).send('Error fetching AI tools');
        } else {
            res.json(results);
        }
    });
};


exports.allAitools = (req, res) => {
    const query = 'SELECT * FROM aitools ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching AI tools:', err);
            res.status(500).send('Error fetching AI tools');
        } else {
            res.json(results);
        }
    });
};

