const express = require('express');
const morgan = require('morgan');

const tourRourter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1- middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('helooo from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRourter);
app.use('/api/v1/users', userRouter);

module.exports = app;
