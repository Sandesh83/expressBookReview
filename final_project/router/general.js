const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBookByAuthor = (author) => {
  let bookList = [];
  for (let book in books) {
    if (books[book].author === author) {
      bookList.push(books[book]);
    }
  }
  return bookList;
};

const getBookByTitle = (title) => {
  let bookList = [];
  for (let book in books) {
    if (books[book].title == title) {
      bookList.push(books[book]);
    }
  }
  return bookList;
};

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      return res.status(400).json({ message: "Username already exists" });
    }
    users.push({ username: username, password: password });

    return res.status(200).json({ message: "User registered successfully" });
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  //Write your code here
  const allBooks = await books;
  return res.status(200).json(allBooks);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    Promise.resolve(book)
      .then((result) => {
        res.status(201).json(result);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      });
  } else {
    Promise.reject(new Error("Book not found")).catch((error) => {
      console.error(error);
      res.status(404).json({ message: "Book not found" });
    });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  //Write your code here
  const author = req.params.author;

  bookList = await getBookByAuthor(author);

  if (bookList.length > 0) {
    return res.status(201).json(bookList);
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  //Write your code here
  const title = req.params.title;
  const bookList = await getBookByTitle(title);
  if (bookList.length > 0) {
    return res.status(201).json(bookList);
  }
  return res.status(404).json({ message: "Book not found" });
});

//  Get book review
public_users.get("/review/:isbn", async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const bookReviews = await books[isbn].reviews;
  if (bookReviews) {
    return res.status(201).json(bookReviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
