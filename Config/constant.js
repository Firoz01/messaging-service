const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

exports.BACKEND_BASE_API_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_API_URL
    : process.env.LOCAL_HOST_API_URL;

exports.NODE_ENV = process.env.NODE_ENV;
exports.PORT = process.env.PORT;

exports.SOCKET_PORT = process.env.SOCKET_PORT;
