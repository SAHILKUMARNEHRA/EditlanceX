const http = require('http');
const server = http.createServer((req, res) => res.end('ok'));
server.listen(5001, () => {
  console.log('HTTP Server listening on 5001');
});
