const db = require('../db');

exports.addSubject = (req, res) => {
    const { name } = req.body;
    const query = 'INSERT INTO subject (name) VALUES (?)';
    db.query(query, [name], (err, result) => {
        if (err) {
            console.log('Error inserting subject:', err);
            res.status(500).send('Error inserting subject');
        } else {
            console.log('subject added successfully');

        }
    })
}

exports.deleteSubject = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM subject WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.log('Error deleting subject:', err);
            res.json(err.stack)
        }
        console.log('Subject Deleted Successfully!')
        res.json(result)
    })
}

exports.allSubject = (req, res) => {
    const query = 'SELECT * FROM subject ORDER BY name ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            res.status(500).send('Error fetching subjects');
        } else {
            res.json(results);
        }
    });
}