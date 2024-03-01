// import express from 'express';
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// 1- middlewares
app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
  console.log('helooo from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//2- Rout handlers
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requstedAt: req.requestTime,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
  //res.send('done');
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<update tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not defined yet',
  });
};

//3- Routes
const tourRourter = express.Router();
const userRouter = express.Router();

// prettier-ignore
tourRourter
  .route('/')
  .get(getAllTours)
  .post(createTour);

// prettier-ignore
tourRourter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// prettier-ignore
userRouter
.route('/')
.get(getAllUsers)
.post(createUser);

// prettier-ignore
userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

app.use('/api/v1/tours', tourRourter);
app.use('/api/v1/users', userRouter);

//start the server
const port = 3000;
app.listen(port, () => {
  console.log(`app running on ${port}....`);
});
