const cluster = require('cluster');
const os = require('os');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

if (cluster.isMaster) {
  // Code to run in the master process
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Fork a new worker if a worker dies
    cluster.fork();
  });

  const DB = process.env.DB_ATLAS;

  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('Database connection successful!');
    })
    .catch((err) => {
      console.log('Database connection failed!');
      console.log(err.name, err.message);
      process.exit(1);
    });
} else {
  const app = require('./app');

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
}
