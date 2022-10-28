const bson = require("bson");
const mongoConnection = require("../modules/mongoConnection.js");
const {httpCodes, sendResponse} = require("../modules/httpCodes.js");

/**
 * Helper function for creating the specified http response (https://pollbuddy.app/api/users).
 * For sample usage see https://github.com/PollBuddy/PollBuddy/wiki/Specifications-%E2%80%90-Backend-Overview#helper-functions
 * @param {*} [data] - data payload returned to the callee upon a successful call
 * @param {string} [error] - error message returned to the callee upon a failed call
 * @typedef {Object} HttpResponse
 * @property {string} result - "success" or "failure", depending on if param "error" is present
 * @property {*} [data] - "data" passed in the param
 * @property {string} [error] - "error" passed in the param
 * @returns {HttpResponse}
 */
function createResponse(data, error) {
  const payload = {
    result: !error ? "success" : "failure"
  };
  if (data) {
    payload.data = data;
  }
  if (error) {
    payload.error = error;
  }
  return payload;
}

// Check if ID exists for a specific Collection
// returns objectID if valid or null if nothing is found.
async function validateID(collection, id) {
  try {
    const objId = new mongoConnection.getMongo().ObjectID(id);
    const res = await mongoConnection.getDB().collection(collection) // find id cursor
      .find({_id: objId}, {limit: 1});
    if (await res.hasNext()) {
      return objId;  // exists
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

/**
 * Convenience function to get the currently logged in user
 * Dumps result into passed callback function
 * @returns {void}
 * @name getCurrentUser
 * @param {req} req request object
 * @param {callback} callback handler for (err,result) returned by database query
 */
function getCurrentUser(req, callback) {
  mongoConnection.getDB().collection("users").findOne({_id: bson.ObjectId(req.session.userData.userID)}, {projection: {Password: false}}, (err, result) => {
    callback(err, result);
  });
}

// Checks if a JS object is empty or not. Returns true if so, false otherwise.
function isEmpty(obj) {
  for (let prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}

/**
 * @typedef {Predicate} - middleware that checks some condition
 * on success : calls next()
 * on failure : send a message on the response object
 */


/**
 * predicate to check If user is logged in in the request
 * @see {Predicate}
 */
function isLoggedIn(req, res, next) {
  if (req.session.userData && req.session.userData.userID) {
    next();
  } else {
    return sendResponse(res, httpCodes.Unauthorized("User is not logged in"));
  }
}

/**
 * Predicate to check if user is siteAdmin
 * Also checks to make sure that the user is logged in
 * @see {Predicate}
 */
let isSiteAdmin = and([isLoggedIn, (req, res, next) => {
  let userID = req.session.userData.userID;
  let user = mongoConnection.getDB().collection("users").findOne({_id: userID});
  if (user.SiteAdmin) {
    next();
  } else {
    return sendResponse(res, httpCodes.InternalServerError("User is not a site admin."));
  }
}]);

/**
 * predicate to check if the running image is in development mode
 * @see {Predicate}
 */
// eslint-disable-next-line no-unused-vars
function isDevelopmentMode(req, res, next) {
  if (process.env.DEVELOPMENT_MODE === "true") {
    next();
  } else {
    return sendResponse(res, httpCodes.InternalServerError("App is not running in development mode."));
  }
}


/**
 * combines a list of predicates into a single predicate
 * succeeds on a given request if and only if at least one of the input predicates succeed
 * ignores and changes a predicate may make to the response object
 * @param {...} ps - any number of predicates
 * @return {Predicate} - composite predicate
 */
function or() {
  let succeeded = false;

  //dummy response object
  //only one response can be sent per request
  //or() needs to allow multiple middleware to run without terminating the response
  //this object absorbs a middleware's attempts to send a response on its own
  let mockRes = {
    status: () => {
      return mockRes;
    },
    send: () => {
      return mockRes;
    },
  };
  return (req, res, next) => {
    for (let i = 0; i < arguments.length; i++) {
      arguments[i](req, mockRes, () => {
        succeeded = true;
      });
      if (succeeded) {
        return next();
      }
    }
    return sendResponse(res, httpCodes.InternalServerError("No conditions passed"));
  };
}

/**
 * combines a list of predicates into a single predicate
 * succeeds on a given request if and only if all input predicates succeed
 * ignores and changes a predicate may make to the response object
 * @param {...} ps - any number of predicates
 * @return {Predicate} - composite predicate
 */
function and() {
  let statusCode = null;
  let responseData = null;

  //dummy response object
  //and() needs to check if a middleware has failed or not
  //this object absorbs a middleware's attempts to send a response on its own
  //the first failed middleware's response is echoed here instead
  let mockRes = {
    status: (x) => {
      statusCode = x;
      return mockRes;
    },
    send: (x) => {
      responseData = x;
      return mockRes;
    },
  };

  return (req, res, next) => {
    for (let i = 0; i < arguments.length; i++) {
      statusCode = null;
      responseData = null;
      arguments[i](req, mockRes, () => {
      });

      // the middleware attempted to send a response
      // echo it then short-ciruit
      if (statusCode) {
        return sendResponse(res, responseData);
      }
    }
    next();
  };
}

// TODO: Documentation
function getResultErrors(result) {
  let errors = {};
  if (result.error) {
    for (let i = 0; i < result.error.details.length; i++) {
      if (result.error.details[i].context.key in result.value) {
        errors[result.error.details[i].context.key] = true;
      }
    }
  }
  return errors;
}

function createModel(schema, data) {
  let model = Object.assign({}, schema);
  for (let key of Object.keys(model)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      model[key] = data[key];
    }
  }
  return model;
}

module.exports = {
  createResponse,
  validateID,
  getCurrentUser,
  isEmpty,
  isLoggedIn,
  isSiteAdmin,
  isDevelopmentMode,
  or,
  and,
  getResultErrors,
  createModel
};
