const bcrypt = require("bcrypt");
const generateRandomString = require("./generate_random_string");

const hash = (password) => {
  return bcrypt.hashSync(password, 10);
};

function createUser(email, password) {
  const newUserID = generateRandomString();

  users[newUserID] = {
    id: newUserID,
    email: email,
    password: hash(password)
  };

  return newUserID;
}

function comparePassword(password, userPassword) {
  return bcrypt.compareSync(password, userPassword);
}

function findUserByEmail(email) {
  // return Object.values(users).find(u => u.email === email);

  for(let userID in users) {
    if(users[userID].email === email) {
      return users[userID];
    }
  }
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

module.exports = {
  data: users,
  createUser: createUser,
  comparePassword: comparePassword,
  findUserByEmail: findUserByEmail
}