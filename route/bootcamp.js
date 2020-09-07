const express = require("express");
const { protect, authorize } = require('../middleware/auth');

const {
  getBootcamp,
  getBootcamps,
  updateBootcamp,
  deleteBootcamp,
  createBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require("../controller/bootcamp");

//Include other resource routers
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');


const router = express.Router();

const advancedresults = require('../middleware/advancedResults');
const Bootcamp = require('../model/bootcamp');

//Re-route into other Router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewsRouter);


router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route("/")
  .get(advancedresults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
