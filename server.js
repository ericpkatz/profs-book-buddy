const { books } = require('./books');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/profs_book_buddy');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhhh';

const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());


app.get('/api/users/me', async(req, res, next)=> {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(token, JWT);
    const SQL = `
      SELECT id, email
      FROM users
      WHERE id = $1
    `;
    const response = await client.query(SQL, [payload.id]);
    res.send(response.rows[0]);

  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/users/register', async(req, res, next)=> {
  try {
    const SQL = `
      INSERT INTO users(email, password)
      VALUES($1, $2)
      RETURNING *
    `;
    const response = await client.query(SQL, [req.body.email, req.body.password]);

    const token = jwt.sign({id: response.rows[0].id}, JWT)
    res.send({ token: token });
  }
  catch(ex){
    next(ex);

  }
});

app.post('/api/users/login', async(req, res, next)=> {
  try {
    const SQL = `
      SELECT id FROM users
      WHERE email = $1 AND password = $2
    `;
    const response = await client.query(SQL, [req.body.email, req.body.password]);

    const token = jwt.sign({id: response.rows[0].id}, JWT)
    res.send({ token: token });
  }
  catch(ex){
    next(ex);

  }
});

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

const createBook = async(book)=> {
  const SQL = `
    INSERT INTO books(
      title,
      author,
      description,
      coverimage
    )
    VALUES(
      $1,$2,$3,$4
    ) RETURNING *
  `;

  const response = await client.query(SQL, [book.title, book.author, book.description, book.coverimage]);
  return response.rows[0];
};

app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({ error: err.message || err});
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  const SQL = `
    DROP TABLE IF EXISTS books;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL
    );
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

  for(let i = 0; i < books.length; i++){
    await createBook(books[i]);
  }
  console.log('books created');

  const port = process.env.PORT || 3000;

  app.listen(port, ()=> console.log(`listening on port ${port}`));
}

init();