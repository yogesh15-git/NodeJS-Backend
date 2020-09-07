const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, removeCourse } = require('../controller/courses');
const Course = require('../model/courses');
const advancedresults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');


const router = express.Router({ mergeParams: true });

router.route('/').get(advancedresults(Course, {
    path: 'bootcamp',
    select: 'name description'
}), getCourses)
    .post(protect, authorize('publisher', 'admin'), createCourse);

router.route('/:id').get(getCourse).put(protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), removeCourse);


module.exports = router;