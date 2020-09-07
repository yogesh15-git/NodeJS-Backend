const path = require('path');
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
// const logger = require("./middleware/logger");
const morgan = require("morgan");
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');

//Route
const bootcamps = require("./route/bootcamp");
const courses = require('./route/courses');
const auth = require('./route/auth');
const users = require('./route/users');
const review = require('./route/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');






//middleWare
const errorHandler = require("./middleware/error");

//LOAD env vars
dotenv.config({ path: "./config/config.env" });

//connect database
connectDB();

const app = express();

//Body Parser
app.use(express.json());

// app.use(logger);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//File upload
app.use(fileupload());
app.use(cookieParser());
//Sanitize data
app.use(mongoSanitize());

//Helmet set security headers used to prevent from cross site scripting attacks
app.use(helmet());
//Xss clean used to prevent from cross site scripting attacks
app.use(xss());

//Rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100
});

app.use(limiter);

//prevent hpp params pollution
app.use(hpp());

//Use CORS
app.use(cors());


//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", review);





app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`)
);
