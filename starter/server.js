const dotenv = require('dotenv');
const app = require('./app');
const Mongoose = require('mongoose');
const { Db } = require('mongodb');

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

const tourSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name'],
  },
  ratining: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'a tour must have a price'],
  },
});
const Tour=Mongoose.model('Tour',tourSchema)

const testTour= new Tour({
  name:'the kamikaze hiker',
  rating:4.7,
  price:499
})
testTour.save().then(doc=>{
  console.log(doc)
}).catch(err=>{
  console.log('error :',err)
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
