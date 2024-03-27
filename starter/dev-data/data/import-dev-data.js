const dotenv = require('dotenv');
const Mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

Mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log('DB connections successful');
});

//read json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//import data into db

exports.importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data successfuly loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

exports.deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data successfuly deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  this.importData();
} else if (process.argv[2] === '--delete') {
  this.deleteData();
}
//node dev-data/data/import-dev-data.js --import
//node dev-data/data/import-dev-data.js --delete
