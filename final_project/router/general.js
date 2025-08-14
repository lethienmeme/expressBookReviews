const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ---------- Task 10: Register a new user ----------
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Store new user
    users[username] = { username, password };
    return res.status(200).json({ message: "User registered successfully" });
});

// ---------- Task 11: Get the book list (Promise) ----------
public_users.get('/', (req, res) => {
    const getBooks = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books available");
        }
    });

    getBooks
        .then(bookList => res.send(JSON.stringify(bookList, null, 4)))
        .catch(err => res.status(500).json({ message: err }));
});

// ---------- Task 12: Get book details by ISBN (Promise) ----------
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    const getBookByISBN = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });

    getBookByISBN
        .then(book => res.send(JSON.stringify(book, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

// ---------- Task 13: Get book details by Author (Promise) ----------
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    const getBooksByAuthor = new Promise((resolve, reject) => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("No books found for this author");
        }
    });

    getBooksByAuthor
        .then(result => res.send(JSON.stringify(result, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

// ---------- Task 13: Get book details by Title (Promise) ----------
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;

    const getBooksByTitle = new Promise((resolve, reject) => {
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject("No books found with this title");
        }
    });

    getBooksByTitle
        .then(result => res.send(JSON.stringify(result, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

// ---------- Get book reviews (unchanged) ----------
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn] && books[isbn].reviews) {
        res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;