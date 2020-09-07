const NodeGeoCoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: "CVEA4jNAR2yMU9Axn9xcm3GxiXJaJhhl",

  formatter: null,
};

const geoCoder = NodeGeoCoder(options);

module.exports = geoCoder;
