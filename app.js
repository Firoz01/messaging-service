const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./ErrorHandler/errorHandler');

const ChatRoute = require('./Routes/chatRoute');
const MessageRoute = require('./Routes/messageRoute');
const { SOCKET_PORT, NODE_ENV } = require('./Config/constant');

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

app.use('/api/v1/chat', ChatRoute);
app.use('/api/v1/message', MessageRoute);


let activeUsers = [];

io.on('connection', (socket) => {
  console.log('client connected');
  // add new User
  socket.on('new-user-add', (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      //console.log("New User Connected", activeUsers);
    }
    // send all active users to new user
    io.emit('get-users', activeUsers);
  });

  // send message to a specific user
  socket.on('send-message', (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    //console.log("Sending from socket to :", receiverId);
    //console.log("Data: ", data);
    if (user) {
      io.to(user.socketId).emit('receive-message', data);
      //console.log("user found", user);
    }
  });

  socket.on('disconnect', () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    //console.log("User Disconnected", activeUsers);
    // send all active users to all users
    io.emit('get-users', activeUsers);
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
