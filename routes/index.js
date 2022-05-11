const express = require('express');
const router = express.Router();
//reference our book model
const Book = require('../models/book');

//we can create our routes
router.get('/', async (req, res) => {
	let books;
	try {
		books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec();
	} catch (error) {
		books = [];
	}
	//Render our view index.ejs
	// pass the book object to access recently added books on index page
	res.render('index', { books: books });
});

//exporting router to setup an application
module.exports = router;
