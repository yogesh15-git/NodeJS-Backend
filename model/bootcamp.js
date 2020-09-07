const mongoose = require("mongoose");
const slugify = require("slugify");
const geoCoder = require("../utility/geocoder");
const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "please add a name"],
    unique: true,
    trim: true,
    maxlength: [50, "name can not be more than 50 characters"],
  },
  slug: String,
  description: {
    type: String,
    require: [true, "please add a name"],
    maxlength: [500, "Descriptions can not be more than 50 characters"],
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "please use a valid URL with HTP",
    ],
  },
  phone: {
    type: String,
    maxlength: [20, "Phone number can not be more than 20 characters"],
  },
  email: {
    type: String,
    match: [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Please add a valid email"],
  },
  address: {
    type: String,
    required: [true, "please add an address"],
  },
  location: {
    //GeoJson point
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],

      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Others",
    ],
  },
  averageRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [10, "rating must can not be more than 10"],
  },
  averageRating: Number,
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  housing: {
    type: Boolean,
    default: false,
  },
  jobAssistance: {
    type: Boolean,
    default: false,
  },
  jobGuarrante: {
    type: Boolean,
    default: false,
  },
  acceptGi: {
    type: Boolean,
    default: false,
  },
  averageCost: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

//create bootcamp slug from name
BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Geocoder and create location fields
BootcampSchema.pre("save", async function (next) {
  const loc = await geoCoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // do not save address in DB
  this.address = undefined;
  next();
});


//Cascade delete courses when bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
  console.log(`courses being deleted from bootcamp ${this._id}`);
  await this.model('course').deleteMany({ bootcamp: this._id })
  next()
})

//Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
