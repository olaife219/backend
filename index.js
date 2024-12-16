const express = require('express')
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const session = require('express-session');
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require('path');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true }));

cloudinary.config({
    cloud_name: 'dyen2qt0p',
    api_key: '137535476674486',
    api_secret: 'yWGLHFTTk1MNWh1S0vc7tDR6n6A',
})



const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads/profile-picture/',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => {
            return 'custom-name-' + Date.now();
        },
    },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, }).single('image');


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');
});

const sessionStore = new MySQLStore({}, db);

// Set up the session middleware
app.use(session({
    key: 'user_cookies',
    secret: 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.put('/api/fileUpload', upload, (req, res) => {

    console.log(req.file)

    const userId = req.session.user.id;
    const imageUrl = req.file.path;

    if (!imageUrl) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const query = 'UPDATE users SET image = ? WHERE id = ?';
    db.query(query, [imageUrl, userId], (err, result) => {
        if (err) {
            console.error('Error updating profile image:', err);
            return res.status(500).json({ message: 'Error updating profile image' });
        } else {
            req.session.user.image = imageUrl;
            res.status(200).json({ message: 'Proile image Updated Successfuly' });
        }
    });
});


app.get('/', (req, res) => {
   res.send("Hello World");
})

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};



app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error logging out');
            res.json('Error logging out');
        }
        res.json('Logged Out Successfully');
    })
})


//Edit User
app.put('/api/editUser', isAuthenticated, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { name, email, password } = req.body;
        const userId = req.session.user.id;

        if (!name && !email && !password) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        if (name) {
            await new Promise((resolve, reject) => {
                const query = 'UPDATE users SET name = ? WHERE id = ?';
                db.query(query, [name, userId], (err) => {
                    if (err) {
                        console.error('Error updating name:', err);
                        return reject(new Error('Error updating name'));
                    }
                    req.session.user.name = name; // Update session
                    resolve();
                });
            });
        }

        if (email) {
            await new Promise((resolve, reject) => {
                const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
                db.query(checkEmailQuery, [email], (err, results) => {
                    if (err) {
                        console.error('Database query error:', err);
                        return reject(new Error('Internal server error'));
                    }

                    if (results.length > 0) {
                        return reject(new Error('Email already in use'));
                    }

                    const query = 'UPDATE users SET email = ? WHERE id = ?';
                    db.query(query, [email, userId], (err) => {
                        if (err) {
                            console.error('Error updating email:', err);
                            return reject(new Error('Error updating email'));
                        }
                        req.session.user.email = email; // Update session
                        resolve();
                    });
                });
            });
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await new Promise((resolve, reject) => {
                const query = 'UPDATE users SET password = ? WHERE id = ?';
                db.query(query, [hashedPassword, userId], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return reject(new Error('Error updating password'));
                    }
                    resolve();
                });
            });
        }

        // Save session updates before responding
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ message: 'Error saving session' });
            }
            res.json({ message: 'User updated successfully' });
        });
    } catch (err) {
        console.error('Error updating user:', err.message);
        if (err.message === 'Email already in use') {
            return res.status(409).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: err.message || 'Internal server error' });
    }
});



// Sign up logic
app.post('/api/signup', async (req, res) => {
    // get the name, email, and password from the signup form
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json('All fields are required');
    }

    const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json('Internal server error');
        }

        if (results.length > 0) {
            // Email already exists
            return res.status(409).json('Email already in use');
        }

        try {
            //encrypt the password before storing it in the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // query to insert the user details to the users table in the database
            const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

            // process the  databse query and pass in the value name, email, hashedPassword into the query then return a successful message if the process is successful and throw error if there is an error
            db.query(query, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Database insert error:', err);
                    return res.status(500).json('Internal server error');
                };
                console.log('User registered:', result.insertId);

                // Store user details in the session
                req.session.user = {
                    id: result.insertId,
                    name,
                    email
                };

                res.json('Signup successful!');
            });
        } catch (error) {
            console.error('Password hashing error:', error);
            res.status(500).json('Internal server error');
        }
    });




});

// logic to get all users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT id, name, email FROM users';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


// sign in logic
app.post('/api/login', async (req, res) => {

    // get the email and password entered by user in the login form
    const { email, password } = req.body;

    // query to get user data from users table in the database where the email is equal to the email enter by the user
    const sql = 'SELECT * FROM users WHERE email = ?';

    // process the  databse query and pass in the value email into the query to check for the user email in the database and the match variable is used to compare password and and the password entered by the user
    db.query(sql, [email], async (err, results) => {
        if (err) {
            // Handle database query errors
            return res.status(500).json('Database error');
        }
        const user = results[0];
        if (user) {

            // Compare provided password with hashed password
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                // Store user details in the session
                req.session.regenerate((err) => {
                    if (err) {
                        console.error('Session regeneration failed:', err);
                        return res.status(500).json('Internal server error');
                    }

                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    };


                    console.log('Session saved:', req.session.user);
                    res.json('Login successful!');
                });
            } else {
                res.status(401).json('Invalid credentials');
            }
        } else {
            res.status(404).json('User not found');
        }
    });
});

//Current logged user
app.get('/api/user', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            success: true,
            user: {
                name: req.session.user.name,
                email: req.session.user.email,
                image: req.session.user.image,
            },
        });
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});




// contact form logic
app.post('/api/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Configure the transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    // Configure the email options
    const mailOptions = {
        from: email,
        to: process.env.GMAIL_USER,
        subject: subject,
        text: `You received a new message from ${name} (${email}):\n ${phone}\n\n${message}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
            res.status(500).send('An error occurred while sending the email.');
        } else {
            console.log('Email sent:', info.response);
            res.send('Your message has been sent successfully!');
        }
    });
});


// Adding of subject by the admin
app.post('/api/addSubject', (req, res) => {
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
})

// Deleting of subject
app.delete('/api/deleteSubject/:id', (req, res) => {
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
})

// Fetch subjects route
app.get('/api/subjects', (req, res) => {
    const query = 'SELECT * FROM subject ORDER BY name ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            res.status(500).send('Error fetching subjects');
        } else {
            res.json(results);
        }
    });
});

// Add event Admin
app.post('/api/addEvents', (req, res) => {
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
});

// Edit Event
app.put('/api/updateEvent/:id', (req, res) => {
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
})


// Delete Event
app.delete('/api/deleteEvent/:id', (req, res) => {
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
})

// Register for an upcoming event
app.post('/api/events/:id/register', (req, res) => {
    const { id } = req.params; // Event ID
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
});



// Fetch events query
app.get('/api/events', (req, res) => {
    const query = `SELECT id, title, description, start_time, end_time, date, location, image_url 
                       FROM events WHERE start_time >= NOW() ORDER BY start_time ASC`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});


// Add news (Admin only)
app.post('/api/news', (req, res) => {
    const { author, title, description, image } = req.body;

    const query = 'INSERT INTO news (author, title, description, image) VALUES (?, ?, ?, ?)';
    db.query(query, [author, title, description, image], (err, result) => {
        if (err) {
            console.error('Error adding news:', err);
            return res.status(500).send('Failed to add news');
        }
        res.send('News added successfully!');
    });
});



// Get all news
app.get('/api/news', (req, res) => {
    const query = 'SELECT * FROM news ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching news:', err);
            return res.status(500).send('Failed to fetch news');
        }
        res.json(results);
    });
});

// Adding promopt
app.post('/api/sendPrompt', (req, res) => {
    const { name, description } = req.body;

    const query = 'INSERT INTO prompt (name, description) VALUES (?, ?)';
    db.query(query, [name, description], (err, result) => {
        if (err) {
            console.error('Error adding prompt:', err);
            return res.status(500).send('Failed to add prompt');
        }
        res.send('prompt added successfully!');
    });
});


//Fetch users prompt
app.get('/api/prompts/user', (req, res) => {
    const userId = req.user?.id;

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
});



//Fetch all prompt
app.get('/api/prompts', (req, res) => {
    const query = 'SELECT * FROM prompt ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching prompts:', err);
            res.status(500).send('Error fetching prompts');
        } else {
            res.json(results);
        }
    });
});

// Adding Ai tool
app.post('/api/sendAitools', (req, res) => {
    const { name, description, url, image } = req.body;

    const query = 'INSERT INTO aitools (name, description, url, image) VALUES (?, ?, ?, ?)';
    db.query(query, [name, description, url, image], (err, result) => {
        if (err) {
            console.error('Error adding AiTool:', err);
            return res.status(500).send('Failed to AiTool');
        }
        res.send('Ai Tool added successfully!');
    });
});


// Fetch limited Ai tools
app.get('/api/dashboard/aitools', (req, res) => {
    const query = 'SELECT * FROM aitools ORDER BY id DESC LIMIT 6';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching AI tools:', err);
            res.status(500).send('Error fetching AI tools');
        } else {
            res.json(results);
        }
    });
});

// Fetch all Ai tools
app.get('/api/aitools', (req, res) => {
    const query = 'SELECT * FROM aitools ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching AI tools:', err);
            res.status(500).send('Error fetching AI tools');
        } else {
            res.json(results);
        }
    });
});


// Add team member (Admin only)
app.post('/api/team', (req, res) => {
    const { name, role, image } = req.body;

    const query = 'INSERT INTO team (name, role, image) VALUES (?, ?, ?)';
    db.query(query, [name, role, image], (err, result) => {
        if (err) {
            console.error('Error adding team member:', err);
            return res.status(500).send('Failed to add team member');
        }
        res.send('Team member added successfully!');
    });
});


// Get all team members
app.get('/api/team', (req, res) => {
    const query = 'SELECT * FROM team ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching team members:', err);
            return res.status(500).send('Failed to fetch team members');
        }
        res.json(results);
    });
});




app.listen(5000, () => {
    console.log('server is listening on http://localhost:5000');

})




