const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/profs_book_buddy');

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.get('/api/books', async(req, res, next)=> {
  try {
    const SQL = `
      SELECT *
      FROM books
    `;
    const response = await client.query(SQL);
    res.send({
      books: response.rows
    });

  }
  catch(ex){
    next(ex);
  }
});

app.get('/', (req, res, next)=> {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  const SQL = `
    DROP TABLE IF EXISTS books;
    CREATE TABLE books(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      author VARCHAR(255),
      description TEXT,
      coverimage VARCHAR(255)
    );
  `;
  await client.query(SQL);
  console.log('tables created');

  const port = process.env.PORT || 3000;

  app.listen(port, ()=> console.log(`listening on port ${port}`));
}

init();