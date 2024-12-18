const express = require('express');
// const session = require('express-session');
// const MySQLStore = require('express-mysql-session')(session);
// const db = require('./db')
// const route = require('./router');
// require('dotenv').config();
// const cors = require("cors");

const app = express();

// app.use(route);
// app.use(
//     cors({
//       origin: 'http://localhost:3000',
//       credentials: true,
//     })
//   );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const sessionStore = new MySQLStore({}, db);

// app.use(session({
//     key: 'user_cookies',
//     secret: 'your-secret-key',
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }
//   }));


  app.get('/', (req, res) => {
    res.send("Hello, wellcome to backend");    
  })

// logic to get all users
// app.get('/api/users', (req, res) => {
//     const sql = 'SELECT id, name, email FROM users';
//     db.query(sql, (err, results) => {
//         if (err) throw err;
//         res.json(results);
//     });
// });

app.listen(5000, () => {
    console.log('server is listening on http://localhost:5000');

})
