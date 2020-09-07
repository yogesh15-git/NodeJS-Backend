const express = require('express');
const { getReviews, getReview, createReview, updateReview, deleteReview } = require('../controller/review');
const Review = require('../model/review');
const advancedresults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');


const router = express.Router({ mergeParams: true });

router.route('/').get(advancedresults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews
).post(protect, authorize('user', 'admin'), createReview);

router.route('/:id').get(getReview).put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);



module.exports = router;