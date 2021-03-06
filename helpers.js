const bcrypt = require('bcrypt');

//Helper Functions
const getUserByEmail = function(email, database) {
  
  let user = undefined;

  for (let i = 0; i < Object.keys(database).length; i++) {
    if (database[Object.keys(database)[i]].email === email) {
      user = database[Object.keys(database)[i]];
    }
  }

  return user;
};

const getUserIDByEmail = function(email, database) {
  
  let user = undefined;

  for (let i = 0; i < Object.keys(database).length; i++) {
    if (database[Object.keys(database)[i]].email === email) {
      user = Object.keys(database)[i];
    }
  }

  return user;
};

const generateRandomString = function() {
  let randomString = "";
  let alphabet = "abcdefghijklmnopqrstuvwxyz1234567890";
  
  for (let i = 0; i < 6; i++) {
    let randomNumb =  Math.floor(Math.random() * 36);

    randomString += alphabet[randomNumb];
  }

  return randomString;
};


const urlsForUser = function(id, database) {
  let listOfURL = [];

  for (let i = 0; i < Object.keys(database).length; i++) {
    if (database[Object.keys(database)[i]].userID === id) {
      listOfURL.push({shortURL: Object.keys(database)[i], longURL: database[Object.keys(database)[i]].longURL});
    }
  }

  return listOfURL;
};

const checkIfUserExists = function (email, database) {
  let exists = false;

  for (let i = 0; i < Object.keys(database).length; i++) {
    if (email === database[Object.keys(database)[i]].email) {
      exists = true;
      break;
    }
  }


  return exists;
}

const checkPasswordMatch = function (password, user) {
  if (bcrypt.compareSync(password, user.password)) {
    return true;
  } else {
    return false;
  }
}

const checkUserAuthentication = function (email, password, database) {
  
    if (checkIfUserExists(email, database)) {

      if (checkPasswordMatch(password, getUserByEmail(email, database))) {
        return true;
      } 
    }

    return false;
  
}




module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkIfUserExists, checkUserAuthentication, getUserIDByEmail };