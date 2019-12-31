import {
  Document,
  model,
  Schema,
  Types,
} from 'mongoose';

// tslint:disable-next-line:interface-name
export interface CourseModel extends Document {
  title: any;
  description: any;
  weeks: any;
  tuition: any;
  minimumSkill: any;
  scholarshipAvailable: any;
  createdAt: any;
  bootcamp: any;
  user: any;
}

const CourseSchema: Schema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [ true, 'Please add a course title' ],
  },
  description: {
    type: String,
    required: [ true, 'Please add a course description' ],
  },
  weeks: {
    type: String,
    required: [ true, 'Please add a number of weeks' ],
  },
  tuition: {
    type: Number,
    required: [ true, 'Please add a tuition cost' ],
  },
  minimumSkill: {
    type: String,
    required: [ true, 'Please add a number of weeks' ],
    enum: [ 'beginner', 'intermediate', 'advanced' ],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
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

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function( bootcampId ) {
  global.console.log('Calculating avg cost...');

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp')
              .findByIdAndUpdate(bootcampId, {
                averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
              });
  } catch (err) {
    global.console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post('save', function( this: any ) {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function( this: any ) {
  this.constructor.getAverageCost(this.bootcamp);
});

export default model<CourseModel>('Course', CourseSchema);
