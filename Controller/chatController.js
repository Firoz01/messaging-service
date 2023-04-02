const Chat = require('../Model/chatModel');
const Message = require('../Model/messageModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');

exports.createChat = catchAsync(async (req, res, next) => {
  const { senderId, receiverId, opt_message } = req.body;

  if (senderId === undefined || receiverId === undefined) {
    return next(new AppError(`SenderId or ReceiverId missing`, 404));
  }

  const text = opt_message;
  const result = await Chat.findOne({
    members: { $all: [senderId, receiverId] }
  });

  if (result) {
    return next(
      new AppError(
        `Already created chat with ${senderId} and ${receiverId}`,
        409
      )
    );
  }

  const newChat = new Chat({
    members: [senderId, receiverId]
  });

  const createdChat = await newChat.save();

  if (text !== null) {
    const chatId = createdChat._id;
    const message = new Message({
      chatId,
      senderId,
      text
    });

    await message.save();
  }

  res
    .status(200)
    .json({ status: 'success', message: 'chat has been created successfully' });
});

exports.userChatLists = catchAsync(async (req, res) => {
  const chatLists = await Chat.find({
    members: { $in: [req.params.userId] }
  });

  // Iterate over each chat list and find the last sent message
  const chatListsWithLastMessage = await Promise.all(
    chatLists.map(async (chat) => {
      const lastMessage = await Message.find({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .limit(1);

      return {
        chatId: chat._id,
        members: chat.members,
        lastMessage: lastMessage.length > 0 ? lastMessage[0] : null
      };
    })
  );

  chatListsWithLastMessage.sort((a, b) => {
    if (!a.lastMessage && !b.lastMessage) {
      return 0;
    } else if (!a.lastMessage) {
      return 1;
    } else if (!b.lastMessage) {
      return -1;
    } else {
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    }
  });

  res.status(200).json({
    status: 'success',
    message: `found ${chatListsWithLastMessage.length} chats`,
    data: chatListsWithLastMessage
  });
});
