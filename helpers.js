//Helper Functions
const getUserByEmail = function(email, database) {
  
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };