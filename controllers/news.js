const db = require('../db');

exports.addNews = (req, res) => {
    const { author, title, description, image } = req.body;

    const query = 'INSERT INTO news (author, title, description, image) VALUES (?, ?, ?, ?)';
    db.query(query, [author, title, description, image], (err, result) => {
        if (err) {
            console.error('Error adding news:', err);
            return res.status(500).send('Failed to add news');
        }
        res.send('News added successfully!');
    });
}

exports.allNews = (req, res) => {
    const query = 'SELECT * FROM news ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching news:', err);
            return res.status(500).send('Failed to fetch news');
        }
        res.json(results);
    });
}

exports.editNews = (req, res) => {
    const { id } = req.params;
    const { author, title, description, image } = req.body

    const query = "UPDATE news SET author = ?, title = ?, description = ? , image = ? WHERE id = ?";

    db.query(query, [author, title, description, image, id], (err, result) => {
        if (err) {
            console.log('Error updating News', err);
            res.json(err)
        }
        console.log('News Updated Successfully');
        res.json(result)

    })
}

exports.deleteNews = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM news WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.log('Error deleting News', err);
            res.json(err)
        }
        console.log('News deleted Successfully');
        res.json(result)

    })
}
