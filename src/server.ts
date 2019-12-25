import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import fileupload from 'express-fileupload';

// Load env vars
dotenv.config();

// Route files
import bootcamps from './routes/bootcamps';
import courses from './routes/courses';
// Middlewares
import { errorHandler } from './middleware/error';
// Connect to Mongo
import connectDB from './config/db';

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// Mount middlewares
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  global.console.log(
    `App running in ${ process.env.NODE_ENV }! mode and listening on port ${ PORT }`,
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', ( err, promise ) => {
  global.console.log(`Error: ${ err }`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
