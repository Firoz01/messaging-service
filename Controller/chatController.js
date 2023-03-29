const Chat = require('../Model/chatModel');
const Message = require('../Model/messageModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');

exports.createChat = catchAsync(async (req, res) => {
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  const optionalMessage = req.body.opt_message;
  const result = await ChatModel.findOne({
    members: { $all: [senderId, receiverId] }
  });

  if (result) {
    return next(
      new AppError(`Already created chat with ${senderId} and ${receiverId}`)
    );
  }

  const newChat = new ChatModel({
    members: [senderId, receiverId]
  });

  const createdChat = await newChat.save();
  if (optionalMessage) {
    const chatId = createdChat._id;
    const message = new Message({
      chatId,
      senderId,
      optionalMessage
    });
    await message.save();
  }

  res.status(200).json('chat has been created successfully');
});

exports.userChatLists = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const chatlists = await Chat.find({ members: { $in: [userId] } });
  if (chatlists.length === 0) {
    return next(
      new AppError(
        `No chat lists found in the the database with that id ${userId}`
      )
    );
  }
  res.status(200).json({
    status: 'success',
    message: ` found ${chatlists.length} chats`,
    data: chatlists
  });
});
