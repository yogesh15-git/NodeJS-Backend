const ErrorResponse = require("../utility/errorResponse");
const courses = require("../model/courses");
const Bootcamp = require("../model/bootcamp");
const asyncHandler = require("../middleware/asyncHandler");


//get all courses =api/vi/courses
//get courses by specific bootcamp=api/vi/bootcamp/id/courses
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const course = await courses.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: course.length,
            data: course
        })
    } else {
        res.status(200).json(
            res.advancedResults
        )
    }

})

//get single courses =api/vi/course/:id
exports.getCourse = asyncHandler(async (req, res, next) => {

    var course = await courses.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`no course found with id ${req.params.id}`), 404)
        // return next()
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

//Add single courses by bootcampId =api/vi/bootcamp/:bootcampId/course
exports.createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`no bootcamp found with id ${req.params.bootcampId}`), 404)
        // return next()
    }
    //Make sure that user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401));
    }
    const course = await courses.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

//Update single courses =api/vi/course/:id
exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await courses.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`no bootcamp found with id ${req.params.id}`), 404)
        // return next()
    }
    //Make sure that user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course to ${course._id}`, 401));
    }
    course = await courses.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
});


//Delete single courses =api/vi/course/:id
exports.removeCourse = asyncHandler(async (req, res, next) => {

    let course = await courses.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`no bootcamp found with id ${req.params.id}`), 404)
        // return next()
    }
    //Make sure that user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course to ${course._id}`, 401));
    }
    await course.remove()

    res.status(200).json({
        success: true,
        data: {}
    });
});

