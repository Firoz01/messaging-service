const io = require('socket.io');

module.exports = function (socketServer) {
  let activeUsers = [];

  function addUser(userId, socketId) {
    if (!activeUsers.some((user) => user.userId === userId)) {
      activeUsers.push({ userId, socketId });
    }
  }

  function removeUser(socketId) {
    activeUsers = activeUsers.filter((user) => user.socketId !== socketId);
  }

  function getUsers() {
    return activeUsers;
  }

  function setupSocket() {
    const socketIO = io(socketServer);

    socketIO.on('connection', (socket) => {
      console.log('client connected');

      socket.on('new-user-add', (newUserId) => {
        addUser(newUserId, socket.id);
        socketIO.emit('get-users', getUsers());
      });

      socket.on('send-message', (data) => {
        const { receiverId } = data;
        const user = getUsers().find((user) => user.userId === receiverId);
        if (user) {
          socketIO.to(user.socketId).emit('receive-message', data);
        }
      });

      socket.on('disconnect', () => {
        removeUser(socket.id);
        socketIO.emit('get-users', getUsers());
      });
    });
  }

  return {
    setupSocket
  };
};
