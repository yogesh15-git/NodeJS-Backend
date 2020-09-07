const path = require('path');
const ErrorResponse = require("../utility/errorResponse");
const geoCoder = require("../utility/geocoder");
const Bootcamp = require("../model/bootcamp");
const asyncHandler = require("../middleware/asyncHandler");

exports.getBootcamps = asyncHandler(async (req, res, next) => {

  res
    .status(200)
    .json(res.advancedResults);
});

exports.getBootcamp = async (req, res, next) => {
  console.log(req.params);
  console.log(req.query);
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not find with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    // res.status(400).json({ success: false });
    next(error);
    // next(
    //   new ErrorResponse(`Bootcamp not find with id of ${req.params.id}`, 404)
    // );
  }
};

exports.createBootcamp = async (req, res, next) => {
  try {
    //Add user to req.body
    req.body.user = req.user.id;

    //Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    //If user is not Publisher or Admin they can add only one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
      return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a Bootcamp`, 400));
    }
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not find with ID ${req.params.id}`, 404));
    }
    //Only bootcamp owner can update
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

//delete bootcamp=app/vi/bootcamp/:id
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      res.status(400).json({ status: false });
    }
    //Only bootcamp owner can update
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401));
    }

    bootcamp.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

//get bootcamp within a radius
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //get lat/lng from geocode
  const loc = await geoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calc radiys radians
  //divide distance by radius of Earth
  //Earth Radius=3,963 mi //6378 km

  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});


//upload bootcamp photo=app/vi/bootcamp/:id/photo
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Only bootcamp owner can update
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401));
  }


  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  //Make sure that file is a image
  const file = req.files.file;
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }
  //Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  //Create custom file name
  file.name = `photo${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      new ErrorResponse(`Problem with file upload`, 500)
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
    res.status(200).json({
      success: true,
      data: file.name
    })
  })

  console.log(file.name);
}); 