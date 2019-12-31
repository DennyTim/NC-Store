import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Load models
import Bootcamp from './models/Bootcamp';
import Course from './models/Course';
import User from './models/User';
import Reviews from './models/Reviews';

// Connect to DB
mongoose.connect(global.process.env.MONGO_URI2 as string, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'bootcamps.json'), 'utf-8'),
);

const courses = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'courses.json'), 'utf-8'),
);

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'users.json'), 'utf-8'),
);

const reviews = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'reviews.json'), 'utf-8'),
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Reviews.create(reviews);

    global.console.log('Data Imported...');
    process.exit();
  } catch (err) {
    global.console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    // @ts-ignore
    await Bootcamp.deleteMany();
    // @ts-ignore
    await Course.deleteMany();
    // @ts-ignore
    await User.deleteMany();
    // @ts-ignore
    await Reviews.deleteMany();

    global.console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    global.console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
