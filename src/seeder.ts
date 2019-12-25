import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Load models
import Bootcamp from './models/Bootcamp';
import Course from './models/Course';

// Connect to DB
mongoose.connect(global.process.env.MONGO_URI2 as string, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'bootcamps.json'), 'utf-8'),
);

const courses = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'courses.json'), 'utf-8'),
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);

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
