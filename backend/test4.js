const express = require('express');
const app = express();
const server = app.listen(5001);
console.log('Server returned from app.listen(5001)', !!server);
