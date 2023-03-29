const express = require('express');
const MessageController = require('../Controller/messageController');
const router = express.Router();

router.post('/', MessageController.addNewMessage);
router.get('/:chatId', MessageController.getAllMessages);

module.exports = router;
