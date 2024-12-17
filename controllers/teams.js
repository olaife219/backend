const { query } = require('express');
const db = require('../db');

exports.addTeam = (req, res) => {
    const { name, role, image } = req.body;

    const query = 'INSERT INTO team (name, role, image) VALUES (?, ?, ?)';
    db.query(query, [name, role, image], (err, result) => {
        if (err) {
            console.error('Error adding team member:', err);
            return res.status(500).send('Failed to add team member');
        }
        res.send('Team member added successfully!');
    });
};


exports.allTeam = (req, res) => {
    const query = 'SELECT * FROM team ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching team members:', err);
            return res.status(500).send('Failed to fetch team members');
        }
        res.json(results);
    });
};

exports.deleteTeam = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM team WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            res.json({message: 'Failed to delete team member'});
        }else{
            res.json({message: 'Team member deleted successfully'})
        }
    })
}
