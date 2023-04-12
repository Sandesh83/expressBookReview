const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  if (users.find((user) => user.username === username)) {
    return true;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign(
        {
          data: password,
        },
        "access",
        { expiresIn: 60 * 60 }
      );
      req.session.accessToken = accessToken;
      req.session.username = username;
      res.status(201).json("Customer logged it sucessfully")
    }
  } else {
    return res
      .status(401)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.username;
  try {
    if (isbn && review  && username) {
      if (isValid(username)) {
        const book = books[isbn];
        for (const book of Object.values(books)) {
          for (const bookReview of book.reviews) {
            if (bookReview.username === username) {
              bookReview.review = review;
              return res.status(200).json({ message : "Review updated sucessfully", review: review}); // review updated successfully
            }
          }
        }
        if (book) {
          bookReview = {
            username: username,
            review: review,
          }
          book.reviews.push(bookReview);
          return res.status(201).json({ message: "Review added successfully", review: review});
        } else {
          return res.status(404).json({ message: "Book not found" });
        }
      } else {
        return res.status(401).json({ message: "User not registered" });
      }
    } else {
      return res.status(400).json({ message: "Invalid request" });
    }
  } catch (error) {
    console.log(error);
  }
  
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.username;
  try {
    if (isbn && username) {
      if (isValid(username)) {
        const book = books[isbn];
        if (book) {
          for (const bookReview of book.reviews) {
            if (bookReview.username === username) {
              book.reviews = book.reviews.filter((review) => review.username !== username);
              return res.status(200).json({ message: "Review deleted successfully" });
            }
          }
          return res.status(404).json({ message: "Review not found" });
        } else {
          return res.status(404).json({ message: "Book not found" });
        }
      } else {
        return res.status(401).json({ message: "User not registered" });
      }
    } else {
      return res.status(400).json({ message: "Invalid request" });
    }
  } catch (error) {
    console.log(error);
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
