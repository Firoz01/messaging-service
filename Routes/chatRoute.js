const express = require('express');
const ChatController = require('../Controller/chatController');
const router = express.Router();

router.post('/', ChatController.createChat);
router.get('/:userId', ChatController.userChatLists);

module.exports = router;
