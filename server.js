const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/profs_book_buddy');

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.get('/api/books', (req, res, next)=> {
  res.send({
    books: []
  });
});

app.get('/', (req, res, next)=> {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  const port = process.env.PORT || 3000;

  app.listen(port, ()=> console.log(`listening on port ${port}`));
}

init();