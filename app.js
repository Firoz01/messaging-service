const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./ErrorHandler/errorHandler');

const ChatRoute = require('./Routes/chatRoute');
const MessageRoute = require('./Routes/messageRoute');
const { SOCKET_PORT, NODE_ENV } = require('./Config/constant');
const AppError = require('./Utils/appError');

const app = express();

const socketServer = require('http').Server(app);
const io = require('socket.io')(socketServer);

app.use(cors());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
  app.use(morgan(':date[clf] ":method :url"'));
}

app.get('/', (req, res) => {
  res.status(200).json('Gono Jobs Messaging service');
});

app.use('/api/v1/chat', ChatRoute);
app.use('/api/v1/message', MessageRoute);

const activeUsers = (function() {
  let users = [];

  return {
    addUser: function(userId, socketId) {
      if (!users.some((user) => user.userId === userId)) {
        users.push({ userId, socketId });
      }
    },
    removeUser: function(socketId) {
      users = users.filter((user) => user.socketId !== socketId);
    },
    getUsers: function() {
      return users;
    }
  };
})();

io.on('connection', (socket) => {
  console.log('client connected');

  socket.on('new-user-add', (newUserId) => {
    activeUsers.addUser(newUserId, socket.id);
    io.emit('get-users', activeUsers.getUsers());
  });

  socket.on('send-message', (data) => {
    const { receiverId } = data;
    const user = activeUsers.getUsers().find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit('receive-message', data);
    }
  });

  socket.on('disconnect', () => {
    activeUsers.removeUser(socket.id);
    io.emit('get-users', activeUsers.getUsers());
  });
});


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

socketServer.listen(SOCKET_PORT, () => {
  console.log(`socket server listening on ${SOCKET_PORT}`);
});

app.use(globalErrorHandler);

module.exports = app;
