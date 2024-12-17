const db = require('../db');

exports.addPrompt = (req, res) => {
    const { name, description } = req.body;

    const query = 'INSERT INTO prompt (name, description) VALUES (?, ?)';
    db.query(query, [name, description], (err, result) => {
        if (err) {
            console.error('Error adding prompt:', err);
            return res.status(500).send('Failed to add prompt');
        }
        res.send('prompt added successfully!');
    });
};


exports.userPrompt = (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' }); // User not signed in
    }

    const query = 'SELECT * FROM prompt WHERE user_id = ? ORDER BY id DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user prompts:', err);
            res.status(500).json({ error: 'Failed to fetch prompts' });
        } else {
            res.status(200).json(results);
        }
    });
};


exports.allPrompt = (req, res) => {
    const query = 'SELECT * FROM prompt ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching prompts:', err);
            res.status(500).send('Error fetching prompts');
        } else {
            res.json(results);
        }
    });
};

exports.editPrompt = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const query = 'UPDATE prompt set name = ?, description = ? WHERE id = ?'
    db.query(query, [name, description, id], (err, result) => {
        if (err) {
            res.json({message: 'Faild to update prompt'});
        }else{
            res.json({message: 'prompt updated successfully'});
        }
    });
}


exports.deletePrompt = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM prompt WHERE id = ?'
    db.query(query, [id], (err, result) => {
        if (err) {
            res.json({message: 'error deleting prompt'});
        }else{
            res.json({message: 'prompt deleted successfully'});
        }
    })
}
 