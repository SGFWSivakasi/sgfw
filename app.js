require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo');
var fs = require('fs'); 
var Product = require('./models/products');

var indexRouter = require('./routes/index');

var app = express();

const mongoUri = 'mongodb+srv://' + process.env.MONGO_ADMIN_UN + ':' + process.env.MONGO_ADMIN_PW + '@cluster0.ks6yjbb.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoUri);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret:'MySuperSecret', 
  resave:false, 
  saveUninitialized:false,
  store: MongoStore.create({ mongoUrl : mongoUri }),
  cookie:{maxAge:180*60*1000},
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  res.locals.session = req.session;
  res.locals.login = req.session.login;
  next();
})

app.use('/', indexRouter);


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
