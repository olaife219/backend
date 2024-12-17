const db = require('../db');

exports.addEvent = (req, res) => {
    const { title, description, start_time, end_time, created_by } = req.body;

    // Validate required fields
    if (!title || !description || !start_time || !end_time) {
        return res.status(400).send('All fields are required');
    }

    const query = `INSERT INTO events (title, description, start_time, end_time, created_by) 
                       VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [title, description, start_time, end_time, created_by], (err, result) => {
        if (err) {
            console.error('Error creating event:', err);
            return res.status(500).send('Internal server error');
        }
        res.status(201).send('Event created successfully');
    });
}


exports.editEvent = (req, res) => {
    const { id } = req.params;
    const { title, description, start_time, end_time, date, location, image } = req.body

    const query = "UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, date = ?, location = ?, image = ? WHERE id = ?";

    db.query(query, [title, description, start_time, end_time, date, location, image], (err, result) => {
        if (err) {
            console.log('Error updating event', err);
            res.json(err)
        }
        console.log('Event Updated Successfully');
        res.json(result)

    })
}

exports.deleteEvent = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM events WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.log('Error deleting event', err);
            res.json(err)
        }
        console.log('Event deleted Successfully');
        res.json(result)

    })
}

exports.registerEvent = (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    const query = `INSERT INTO event_registrations (event_id, user_id, registered_at) 
                       VALUES (?, ?, NOW())`;

    db.query(query, [id, user_id], (err, result) => {
        if (err) {
            console.error('Error registering for event:', err);
            return res.status(500).send('Internal server error');
        }
        res.send('Registration successful');
    });
}


exports.allEvent = (req, res) => {
    const query = `SELECT id, title, description, start_time, end_time, date, location, image_url 
                       FROM events WHERE start_time >= NOW() ORDER BY start_time ASC`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
}