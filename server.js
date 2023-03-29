const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting Down...');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// const DB = process.env.DB_LOCAL;
const DB = process.env.DB_ATLAS;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Database connection successful!');
  });

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`The server is running at port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting Down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
