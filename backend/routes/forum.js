const express = require('express');
const forumController = require('../controllers/forumController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/discussions', forumController.getDiscussions);
router.get('/discussions/:id', forumController.getDiscussionById);
router.post('/discussions', ensureAuthenticated, forumController.createDiscussion);
router.post('/discussions/:id/replies', ensureAuthenticated, forumController.addReply);

module.exports = router;
