const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Shared users array
let users = [
  { username: "john", password: "1234" }
];

// Check if username already exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Create JWT token
  let accessToken = jwt.sign({ username }, "your_jwt_secret_key", { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
  
  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.session.authorization.username;

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review successfully added/updated", book: books[isbn] });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "You must be logged in to delete a review" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;