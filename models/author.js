const mongoose = require('mongoose');
//include our book model
const Book = require('./book');

//create schema(In MONGODB schema is same as table in database)
const authorSchema = new mongoose.Schema({
	//Create Columns(In MONGODB columns are in JSON format)
	name: {
		type: String,
		required: true
	}
});

//setting up constraints
//pre allow us to run function before code executes
//using normal function to access author
//next going to callback
authorSchema.pre('remove', function(next) {
	Book.find({ author: this.id }, (err, books) => {
		if (err) {
			next(err);
		} else if (books.length > 0) {
			next(new Error('This author has book still'));
		} else {
			next();
		}
	});
});

//export the schema(Author as Table name)
module.exports = mongoose.model('Author', authorSchema);
