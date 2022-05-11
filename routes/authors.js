const express = require('express');
const router = express.Router();
//Input author variable use to pass new author to author.ejs
const Author = require('../models/author');
//import book model to display authors book covers
const Book = require('../models/book');

//we can create our routes
//All authors route
router.get('/', async (req, res) => {
	//Create search options to search parameter(we have only name)
	let searchOptions = {};
	if (req.query.name != null && req.query.name !== '') {
		searchOptions.name = new RegExp(req.query.name, 'i');
	}
	try {
		const authors = await Author.find(searchOptions);
		//Render our view index.ejs
		res.render('authors/index', {
			authors: authors,
			searchOptions: req.query
		});
	} catch (error) {
		res.redirect('/');
	}
});

//get request with address/new will not execute if we put this address after get request /:id
//New Author Route for displaying the form
router.get('/new', (req, res) => {
	res.render('authors/new', { author: new Author() });
});

//Create Author Route
router.post('/', async (req, res) => {
	const author = new Author({
		name: req.body.name //Parameters accept from client(name) because client can send other stuff(_id)
	});
	try {
		const newAuthor = await author.save();
		res.redirect(`/authors/${newAuthor.id}`);
	} catch (error) {
		res.render('authors/edit', {
			author: author, //repopulating the new author name entered
			errorMessage: 'Error Creating Author'
		});
	}
	/**
	 * this code can be writen cleaner
	 * using try and catch block
	 */
	// author.save((err, newAuthor) => {
	// 	if (err) {
	// 		res.render('/authors/new', {
	// 			author: author, //repopulating the new author name entered
	// 			errorMessage: 'Error creating Author'
	// 		});
	// 	} else {
	// 		// res.redirect(`authors/${newAuthor.id}`); //using stringinterpolation so use backticks(`)
	// 		res.redirect('/authors');
	// 	}
	// });
});

//route for showing our user
// need to pass id for pathParams
router.get('/:id', async (req, res) => {
	//params are the parameter we pass in the url
	// res.send('Show Author ' + req.params.id);

	try {
		const author = await Author.findById(req.params.id);
		const books = await Book.find({ author: author.id }).limit(6).exec();
		res.render('authors/show', {
			author: author,
			booksByAuthor: books
		});
	} catch (error) {
		res.redirect('/');
	}
});

//route for edit our user
router.get('/:id/edit', async (req, res) => {
	//params are the parameter we pass in the url
	try {
		// this is a build in method of mongoose it will get id and find author of same id
		// it will find the user by id if exist
		const author = await Author.findById(req.params.id);
		res.render('authors/edit', { author: author });
	} catch (error) {
		res.redirect('/authors');
	}
});

/** FROM BROWSER WE CAN ONLY MAKE GET AND POST REQUEST WE HAVE NO WAY TO REQUEST PUT AND DELETE FROM BROWSER 
 * 	METHOD-OVERRIGHT LIBRARY ALLOW US TO TAKE A POST FORM SEND THAT TO OUR SERVER WITH A SPECIAL PARAMETER THAT
 * 	TELL US IF WERE DOING PUT OR DELETE REQUEST AND OUR SERVER IS SMART ENOUGH TO CALL THAT REQUEST BASED ON 
 * 	THAT SPECIFIC PARAMETER
 */

//route for update our user
router.put('/:id', async (req, res) => {
	//params are the parameter we pass in the url
	// res.send('Update Author ' + req.params.id);

	let author;
	// we need to use author variable in both try and catch block because code can fail twice
	// 1. find the author
	// 2. save the updated author
	try {
		author = await Author.findById(req.params.id);
		//change author name before saving
		author.name = req.body.name;
		await author.save();
		res.redirect(`/authors/${author.id}`);
	} catch (error) {
		console.log(error);

		if (author == null) {
			res.redirect('/');
		} else {
			res.render('/authors/edit', {
				author: author, //repopulating the new author name entered
				errorMessage: 'Error updating Author'
			});
		}
	}
});

//route for delete our user
router.delete('/:id', async (req, res) => {
	//params are the parameter we pass in the url
	// res.send('Delete Author ' + req.params.id);

	let author;
	// we need to use author variable in both try and catch block because code can fail twice
	// 1. find the author
	// 2. save the updated author
	try {
		author = await Author.findById(req.params.id);
		//here we are removing author
		await author.remove();
		res.redirect('/authors');
	} catch (error) {
		if (author == null) {
			res.redirect('/');
		} else {
			res.redirect(`/authors/${author.id}`);
		}
	}
});

//exporting router to setup an application
module.exports = router;
