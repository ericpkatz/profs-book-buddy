const express = require('express');
const app = express();

app.get('/', (req, res, next)=> {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

const port = process.env.PORT || 3000;

app.listen(port, ()=> console.log(`listening on port ${port}`));