const ErrorResponse = require("../utility/errorResponse");
const Review = require("../model/review");
const Bootcamp = require("../model/bootcamp");
const asyncHandler = require("../middleware/asyncHandler");
const { update } = require("../model/bootcamp");

//get all reviews=api/vi/reviews
//get courses by specific bootcamp=api/vi/bootcamp/id/reviews
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const review = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: review.length,
            data: review
        })
    } else {
        res.status(200).json(
            res.advancedResults
        )
    }

});

//get single review by id=api/vi/review
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate(
        {
            path: 'bootcamp',
            select: 'name description'
        });

    if (!review) {
        return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: review })

});

//Post  review by bootcampId =api/vi/bootcamp/:bootcampId/review
exports.createReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found with id ${req.params.bootcampId}`, 404));
    };

    const review = await Review.create(req.body);

    res.status(200).json({ success: true, data: review })

});

//Update review by Id =api/vi/review/:id
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review found by id ${req.params.id}`, 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update review', 401));
    }

    const updateDetails = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: updateDetails
    });
});


//Delete review by Id =api/vi/review/:id
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review found by id ${req.params.id}`, 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete review', 401));
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});
