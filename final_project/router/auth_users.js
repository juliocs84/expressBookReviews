const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Returns true when the username is still available (valid to register)
const isValid = (username) => {
  return !users.some((user) => user.username === username);
}

// Returns true when username and password match a registered user
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
}

// Task 7 - Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in: username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate the JWT and store it in the session
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  }

  return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

// Task 8 - Add or modify a book review (logged in user only)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required (use ?review=...)" });
  }

  const isUpdate = Boolean(books[isbn].reviews[username]);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: isUpdate
      ? `Review for the book with ISBN ${isbn} was successfully updated by ${username}`
      : `Review for the book with ISBN ${isbn} was successfully added by ${username}`,
    reviews: books[isbn].reviews
  });
});

// Task 9 - Delete a book review made by the logged in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: `No review from ${username} found for ISBN ${isbn}` });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review for the book with ISBN ${isbn} posted by user ${username} was deleted`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
