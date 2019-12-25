import mongoose, {
  Mongoose,
} from 'mongoose';

const connectDB = async () => {
  const connect: Mongoose = await mongoose.connect(global.process.env.MONGO_URI2 as string, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  global.console.log(`MongoDB Connected ${ connect.version}`);
};

export default connectDB;
