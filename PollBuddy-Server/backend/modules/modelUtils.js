const bson = require("bson");
const mongoConnection = require("./mongoConnection.js");
const {httpCodes} = require("./httpCodes");

const getID = function (ID) {
  return new bson.ObjectID(ID);
};

const getGroupInternal = async function(groupID) {
  let idCode = new bson.ObjectID(groupID);
  let group = await mongoConnection.getDB().collection("groups").findOne({ "_id": idCode });
  return group;
};

const isGroupAdmin = async function(groupID, userID) {
  let idCode = new bson.ObjectID(groupID);
  let group = await mongoConnection.getDB().collection("groups").findOne({ "_id": idCode });
  for (let admin of group.Admins) {
    if (admin.toString() === userID.toString()) {
      return true;
    }
  }
  return false;
};

const isGroupMember = async function(groupID, userID) {
  let idCode = new bson.ObjectID(groupID);
  let group = await mongoConnection.getDB().collection("groups").findOne({ "_id": idCode });
  for (let user of group.Users) {
    if (user.toString() === userID.toString()) {
      return true;
    }
  }
  return false;
};

const getPollInternal = async function(pollID) {
  let idCode = new bson.ObjectID(pollID);
  let poll = await mongoConnection.getDB().collection("polls").findOne({ "_id": idCode });
  return poll;
};

const getUserInternal = async function(userID) {
  let idCode = new bson.ObjectID(userID);
  return await mongoConnection.getDB().collection("users").findOne({ "_id": idCode });
};

const getQuestionInternal = async function(pollID, questionID) {
  let poll = await getPollInternal(pollID);
  for (let question of poll.Questions) {
    if (question._id.toString() === questionID.toString()) {
      return question;
    }
  }
};

const isPollAdmin = async function(userID, pollID) {
  let poll = await getPollInternal(pollID);
  if (poll.Group) {
    let group = await getGroupInternal(poll.Group);
    let isUserGroupAdmin = await isGroupAdmin(group._id, userID);
    if (!isUserGroupAdmin) { return false; }
  } else {
    let isUserPollCreator = poll.Creator.toString() === userID.toString();
    if (!isUserPollCreator) { return false; }
  }
  return true;
};

module.exports = {
  getGroupInternal,
  isGroupMember,
  isGroupAdmin,
  getPollInternal,
  getUserInternal,
  getQuestionInternal,
  isPollAdmin,
  getID
};