const Message = require('../Model/messageModel');
const catchAsync = require('../Utils/catchAsync');

exports.addNewMessage = catchAsync(async (req, res, next) => {
  const { chatId, senderId, text } = req.body;

  const message = new Message({
    chatId,
    senderId,
    text
  });

  const result = await message.save();

  res.status(200).json({
    status: 'success',
    message: `message send successfully`,
    data: result
  });
});

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const result = await Message.find({ chatId });

  res.status(200).json({
    status: 'success',
    message: `Successfully get all messages`,
    data: result
  });
});
