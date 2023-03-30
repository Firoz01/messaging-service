const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
  {
    members: {
      type: [String],
      required: [true, 'members can not be empty']
    }
  },
  {
    timestamps: true
  }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
