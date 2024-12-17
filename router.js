const express = require('express');
const router = express.Router();

const userAuth = require('./controllers/userAuth');
const EditProfile = require('./controllers/EditProfile');
const contact = require('./controllers/contact')
const subject = require('./controllers/subject');
const event = require('./controllers/events');
const news = require('./controllers/news');
const prompts = require('./controllers/prompts');
const aitools = require('./controllers/aitools');
const team = require('./controllers/teams');
const { isAuthenticated } = require('./middleware/middleware');
const { upload } = require('./cloudinary');

router.post('/api/signup', userAuth.signup);
router.post('/api/login', userAuth.login);
router.get('/api/user', userAuth.user);
router.post('/api/logout', userAuth.logout);
router.put('/api/editUser', isAuthenticated, EditProfile.edit);
router.put('/api/fileUpload', isAuthenticated, upload, EditProfile.profilePicture);
router.post('/api/contact', contact.contact);
router.post('/api/addSubject', subject.addSubject);
router.delete('/api/deleteSubject/:id', subject.deleteSubject);
router.get('/api/subjects', subject.allSubject);
router.get('/api/events', event.allEvent);
router.post('/api/events/:id/register', event.registerEvent);
router.post('/api/addEvents', event.addEvent);
router.put('/api/updateEvent/:id', event.editEvent);
router.delete('/api/deleteEvent/:id', event.deleteEvent)
router.get('/api/news', news.allNews);
router.post('/api/addNews', news.addNews);
router.put('/api/editNews', news.editNews);
router.delete('/api/deleteNews', news.deleteNews);
router.post('/api/addPrompt', prompts.addPrompt);
router.get('/api/userprompt', prompts.userPrompt);
router.get('/api/prompts', prompts.allPrompt);
router.post('/api/addAitools', aitools.addAitools);
router.get('/api/dashboard/aitools', aitools.dashboardTools);
router.get('/api/aitools', aitools.allAitools);
router.post('/api/addTeam', team.addTeam);
router.get('/api/allteam', team.allTeam);



module.exports = router;