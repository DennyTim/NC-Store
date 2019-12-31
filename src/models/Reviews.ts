import {
  Document,
  model,
  Schema,
  Types,
} from 'mongoose';

// tslint:disable-next-line:interface-name
export interface ReviewModel extends Document {
  title: any;
  text: any;
  rating: any;
  createdAt: any;
  bootcamp: any;
  user: any;
}

const ReviewSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [ true, 'Please add a title for the review' ],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [ true, 'Please add some text' ],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [ true, 'Please add a rating between 1 and 10' ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({
  bootcamp: 1,
  user: 1,
}, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function( bootcampId ) {
  global.console.log('Calculating avg cost...');

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    const { averageRating } = obj[0];
    await this.model('Bootcamp')
              .findByIdAndUpdate(bootcampId, { averageRating });
  } catch (err) {
    global.console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function( this: any ) {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function( this: any ) {
  this.constructor.getAverageRating(this.bootcamp);
});

export default model<ReviewModel>('Review', ReviewSchema);
