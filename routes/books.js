const express = require('express');
const router = express.Router();
//use multer library to create actual book file
// const multer = require('multer');
//import library built into node.js
// const path = require('path');
//import new fs library ro delete unsaved book covers
const fs = require('fs');

//Array to store image type
const imageMimeTypes = [ 'image/jpeg', 'image/png', 'image/jpg', 'image/gif' ];
//Input author variable use to pass new author to author.ejs
//create our book model
const Book = require('../models/book');
//create our upload path variable, using join() which will combine 2 different paths
// const uploadPath = path.join('public', Book.coverImageBasePath);
//use author model
const Author = require('../models/author');
//import multer file
// const upload = multer({
// 	//where the upload going to be(we want to put out image file into public folder)
// 	//import path variable from our model(coverImageBasePath)
// 	dest: uploadPath,
// 	// filefilter allow us file which server accepts
// 	// (req) request of our file
// 	// (file) actual file Object
// 	// (callback) we need to call whenever we are done here
// 	fileFilter: (req, file, callback) => {
// 		callback(null, imageMimeTypes.includes(file.mimetype));
// 	}
// });

//we can create our routes
//All books route
router.get('/', async (req, res) => {
	// need to use let inplace of const because we are reassigning the variable 'query'
	let query = Book.find();
	// search for book title
	if (req.query.title) {
		query = query.regex('title', new RegExp(req.query.title, 'i'));
	}
	// search for book Published before
	if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
		query = query.lte('publishDate', req.query.publishedBefore);
	}
	// search for book Published after
	if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
		query = query.gte('publishDate', req.query.publishedAfter);
	}

	try {
		// exec() -> will append the query variable that we declare above
		const books = await query.exec();
		res.render('books/index', {
			books: books,
			searchOptions: req.query
		});
	} catch (error) {
		res.redirect('/');
	}
});

//New book Route for displaying the form
router.get('/new', async (req, res) => {
	renderNewPage(res, new Book());
});

//Create book Route
//setting up route to accept file
router.post('/', async (req, res) => {
	const book = new Book({
		title: req.body.title,
		author: req.body.author,
		publishDate: new Date(req.body.publishDate),
		pageCount: req.body.pageCount,
		description: req.body.description
	});
	saveCover(book, req.body.cover);

	try {
		const newBook = await book.save();
		res.redirect(`books/${newBook.id}`);
	} catch (error) {
		renderNewPage(res, book, true);
	}
});

// show book route
router.get('/:id', async (req, res) => {
	try {
		// findById will only give book information not the author name
		// we pass author collection to populate method to get all the author information
		// linked to req.params.id
		//populate preloads author information into an object
		const book = await Book.findById(req.params.id).populate('author').exec();
		res.render('books/show', {
			book: book
		});
	} catch (error) {
		res.redirect('/');
	}
});

// edit book route
router.get('/:id/edit', async (req, res) => {
	try {
		const book = await Book.findById(req.params.id);
		renderEditPage(res, book);
	} catch (error) {
		res.render('/');
	}
});

// update book route
router.put('/:id', async (req, res) => {
	let book;

	try {
		book = await Book.findById(req.params.id);
		book.title = req.body.title;
		book.author = req.body.author;
		book.publishDate = new Date(req.body.publishDate);
		book.pageCount = req.body.pageCount;
		book.description = req.body.description;
		if (req.body.cover != null && req.body.cover !== '') {
			saveCover(book, req.book.cover);
		}
		// if every thing go correct then save book
		await book.save();
		// then redirect to
		res.redirect(`/books/${book.id}`);
	} catch (error) {
		console.log(error);

		if (book != null) {
			renderEditPage(res, book, true);
		} else {
			res.redirect('/');
		}
		renderNewPage(res, book, true);
	}
});

// delete book page
router.delete('/:id', async (req, res) => {
	let book;
	try {
		book = await Book.findById(req.params.id);
		await book.remove();
		res.redirect('/books');
	} catch (error) {
		if (book != null) {
			res.render('books/show', {
				book: book,
				errorMessage: 'could not remove book'
			});
		} else {
			res.redirect('/');
		}
	}
});

// function removeCoverImage(fileName) {
// 	fs.unlink(path.join(uploadPath, fileName), (err) => {
// 		if (err) {
// 			console.error(err);
// 		}
// 	});
// }

//Encapsulate the new book routing login
async function renderNewPage(res, book, hasError = false) {
	renderFormPage(res, book, 'new', hasError);
}

// function to edit book
async function renderEditPage(res, book, hasError = false) {
	renderFormPage(res, book, 'edit', hasError);
}

// shared function for form
async function renderFormPage(res, book, form, hasError = false) {
	try {
		// get all the authors to be displayed in our view
		const authors = await Author.find({});
		// in order to create dynamic error message
		const params = {
			authors: authors,
			book: book
		};

		if (hasError) {
			if (form === 'edit') {
				params.errorMessage = 'Error Updating Book';
			} else {
				params.errorMessage = 'Error Creating Book';
			}
		}
		res.render(`books/${form}`, params);
	} catch (error) {
		res.redirect('/books');
	}
}

function saveCover(book, coverEncoded) {
	if (coverEncoded == null) return;
	const cover = JSON.parse(coverEncoded);
	if (cover != null && imageMimeTypes.includes(cover.type)) {
		book.coverImage = new Buffer.from(cover.data, 'base64');
		book.coverImageType = cover.type;
	}
}

//exporting router to setup an application
module.exports = router;
