const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL used by the Axios calls below (Tasks 10 to 13)
const BASE_URL = "http://localhost:5000";

/* -------------------------------------------------------------------------
   Internal endpoint that exposes the raw book database.
   Tasks 10-13 consume this endpoint with Axios, which is what turns the
   local lookups into real asynchronous HTTP operations.
   ---------------------------------------------------------------------- */
public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

// Task 6 - Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/* =========================================================================
   Task 10 - Get the book list available in the shop
   Implemented with Axios + Promise callbacks (.then / .catch)
   ====================================================================== */
public_users.get('/', function (req, res) {
  axios.get(`${BASE_URL}/books`)
    .then((response) => {
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching the book list", error: error.message });
    });
});

/* =========================================================================
   Task 11 - Get book details based on ISBN
   Implemented with Axios + async/await
   ====================================================================== */
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`${BASE_URL}/books`);
    const book = response.data[isbn];

    if (book) {
      return res.status(200).send(JSON.stringify(book, null, 4));
    }
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the book", error: error.message });
  }
});

/* =========================================================================
   Task 12 - Get book details based on author
   Implemented with Axios + async/await
   ====================================================================== */
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;

    const booksByAuthor = Object.keys(allBooks)
      .filter((isbn) => allBooks[isbn].author.toLowerCase() === author.toLowerCase())
      .map((isbn) => ({ isbn: isbn, ...allBooks[isbn] }));

    if (booksByAuthor.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
    }
    return res.status(404).json({ message: `No book found by author ${author}` });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

/* =========================================================================
   Task 13 - Get all books based on title
   Implemented with Axios + async/await
   ====================================================================== */
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;

    const booksByTitle = Object.keys(allBooks)
      .filter((isbn) => allBooks[isbn].title.toLowerCase() === title.toLowerCase())
      .map((isbn) => ({ isbn: isbn, ...allBooks[isbn] }));

    if (booksByTitle.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbytitle: booksByTitle }, null, 4));
    }
    return res.status(404).json({ message: `No book found with title ${title}` });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

// Task 5 - Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
});

module.exports.general = public_users;
