const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
  {
    members: {
      type: Array,
      required: [true, 'sender Id  and  Receiver required in array formate']
    }
  },
  {
    timestamps: true
  }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
