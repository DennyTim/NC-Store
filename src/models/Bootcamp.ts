import slugify from 'slugify';
import geocoder from '../utils/geocoder';
import { NextFunction } from 'express';
import {
  Document,
  model,
  Schema,
  Types,
} from 'mongoose';

// tslint:disable-next-line:interface-name
export interface BootcampModel extends Document {
  id?: any;
  name?: any;
  slug?: any;
  description?: any;
  website?: any;
  address?: any;
  location?: any;
  careers?: any;
  averageRating?: any;
  averageCost?: any;
  photo?: any;
  housing?: any;
  jobAssistance?: any;
  jobGuarantee?: any;
  acceptGi?: any;
  createdAt?: any;
  user?: any;
}

const BootcampSchema: Schema = new Schema({
  name: {
    type: String,
    required: [ true, 'Please add a name' ],
    unique: true,
    trim: true,
    maxlength: [ 50, 'Name can not be more than 50 characters' ],
  },
  slug: String,
  description: {
    type: String,
    required: [ true, 'Please add a name' ],
    maxlength: [ 350, 'Name can not be more than 350 characters' ],
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS',
    ],
  },
  address: {
    type: String,
    required: [ true, 'Please add an address' ],
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: [ 'Point' ],
    },
    coordinates: {
      type: [ Number ],
      index: '2dsphere',
    },
    formattedAddress: String,
    city: String,
    street: String,
    state: String,
    zipcode: String,
    country: String,
  },
  careers: {
    // Array of strings
    type: [ String ],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other',
    ],
  },
  averageRating: {
    type: Number,
    min: [ 1, 'Rating must be at least 1' ],
    max: [ 10, 'Rating must can not be more than 10' ],
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg',
  },
  housing: {
    type: Boolean,
    default: false,
  },
  jobAssistance: {
    type: Boolean,
    default: false,
  },
  jobGuarantee: {
    type: Boolean,
    default: false,
  },
  acceptGi: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

// Create bootcamp slug from the name
BootcampSchema.pre<BootcampModel>('save', function( next: NextFunction ): void {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode & create location field
BootcampSchema.pre<BootcampModel>('save', async function( next: NextFunction ) {
  const loc = await geocoder.geocode(this.address);
  const {
    longitude,
    latitude,
    formattedAddress,
    streetName,
    stateCode,
    zipcode,
    city,
    countryCode,
  } = loc[0];
  this.location = {
    type: 'Point',
    coordinates: [ longitude, latitude ],
    formattedAddress,
    city,
    street: streetName,
    state: stateCode,
    zipcode,
    country: countryCode,
  };

  // Do not save address in db
  this.address = undefined;
  next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function( next ) {
  global.console.log(`Courses being removed from bootcamp ${ this._id }`);
  await this.model('Course')
            .deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals (simple relationship)
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

export default model<BootcampModel>('Bootcamp', BootcampSchema);
