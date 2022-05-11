//check
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
//express has no easy way to access variables
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

//import router into server
//for index
const indexRouter = require('./routes/index');
//for author
const authorRouter = require('./routes/authors');
//for book
const bookRouter = require('./routes/books');

//set our view engine
app.set('view engine', 'ejs', {
	useUnifiedTopology: true
});
//where our view going to be coming from
app.set('views', __dirname + '/views');
//hook up express layouts( to use common header and footer)
app.set('layout', 'layouts/layout');
//tell app need to use express layout
app.use(expressLayouts);
//tell app to use method-override library
app.use(methodOverride('_method'));
//tell app where our public files(HTML, CSS, JAVASCRIPT, IMAGES) going to be
app.use(express.static('public'));
//tell express how to use body parser
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));

//integrate mongodb to our app
const mongoose = require('mongoose');
//setup connections for database
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
//access the connection
const db = mongoose.connection;
//if we run into an error while connecting to our database
db.on('error', (error) => console.error(error));
//run once when we open our database for first time
db.once('open', () => console.log('connected to mongoose'));

//tell app to use router for index
app.use('/', indexRouter);
//tell app to use router for authors
app.use('/authors', authorRouter);
//tell app to use router for books
app.use('/books', bookRouter);

//tell app we want to listen on PORT
app.listen(process.env.PORT || 3000);
