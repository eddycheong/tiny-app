const bcrypt = require("bcrypt");
const generateRandomString = require("./generate_random_string");

const hash = (password) => {
  return bcrypt.hashSync(password, 10);
};

const Users = {
  data: {
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
  },
  createUser: function(email, password) {
    const users = this.data;
    const newUserID = generateRandomString();

    users[newUserID] = {
      id: newUserID,
      email: email,
      password: hash(password)
    };

    return newUserID;
  },
  comparePassword: function(password, userPassword) {
    return bcrypt.compareSync(password, userPassword);
  },
  findUserByEmail: function(email) {
    const users = this.data;

    for(let userID in users) {
      if(users[userID].email === email) {
        return users[userID];
      }
    }
  }
}


module.exports = Users;