const mongoose = require('mongoose');
const MessageSchema = mongoose.Schema(
  {
    chatId: {
      type: String,
      requried: [true, 'A message must have chatId']
    },
    senderId: {
      type: String,
      requried: [true, 'A message must have senderId']
    },

    text: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
