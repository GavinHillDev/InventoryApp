var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var dotenv = require('dotenv')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var inventoryRouter = require('./routes/inventory');
const compression = require('compression');
const helmet = require('helmet');


var app = express();

dotenv.config()

const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//Get the default connection
mongoose.Promise = global.Promise;
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// app.use(compression()); //Compress all routes

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); //Compress all routes

app.use(express.static(path.join(__dirname, 'public')));
// app.use(helmet());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/inventory', inventoryRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
