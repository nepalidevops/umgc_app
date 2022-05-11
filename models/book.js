const mongoose = require('mongoose');
//import path to access file structure
// const path = require('path');
//variable to store all cover image
// const coverImageBasePath = 'uploads/bookCovers';

//create schema(In MONGODB schema is same as table in database)
const bookSchema = new mongoose.Schema({
	//Create Columns(In MONGODB columns are in JSON format)
	title: {
		type: String,
		required: true
	},
	description: {
		//not using "required:true" will let us add book without description
		type: String
	},
	publishDate: {
		type: Date,
		required: true
	},
	pageCount: {
		//mongoDB uses same type as json for integer
		type: Number,
		required: true
	},
	createdAt: {
		//createAt date required to sort books by their created date
		type: Date,
		required: true,
		//set default date to current date so user don't have to add date every time create new book
		default: Date.now
	},
	coverImage: {
		// instead of passing the image itself to the database we are passing the name of image as a
		// small string and can store actual string on our server in file system
		type: Buffer,
		required: true
	},
	coverImageType: {
		type: String,
		required: true
	},
	author: {
		// this essentially just referencing another object, this is just the id of author object and this
		// is telling mongoose that this reference is another object inside of our collection
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		//tell mongoose what we are referencing
		ref: 'Author'
	}
});

// Create a virtual propert
// it will allow us to access(derive) all the variables we have in our book schema
// when we call book.coverImagepath it will call function inside the get function
bookSchema.virtual('coverImagePath').get(function() {
	//we are using simple function so we can use (this.)
	//path.join will combine
	//'/' -> base folder location
	//'coverImageBasePath' -> cover image path
	// 'this.coverImageName' -> image name
	if (this.coverImage != null && this.coverImageType != null) {
		return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
	}
});

//export the schema(Author as Table name)
module.exports = mongoose.model('Book', bookSchema);
//export cover image path variable
//we dont want to import it as default, we want to import it as variable name
// module.exports.coverImageBasePath = coverImageBasePath;
