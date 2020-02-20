const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');

const { generateRandomString, urlsForUser, checkIfUserExists, checkUserAuthentication, getUserIDByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: "session",
  keys: ["user_id"]
}));

app.set('view engine', 'ejs');

///////////////
//Data
///////////////

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "randID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "fakeID"},
  "hfj3sn": { longURL: "gluggle.com", userID: "randID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};

///////////////
//Ports
///////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Showing main page of URLs
app.get("/urls", (req, res) => {
  let usersURLs = [];
 
  //Check if user is in a session
  if (req.session.user_id) {
    usersURLs = urlsForUser(req.session.user_id, urlDatabase);
    let templateVars = {id: req.session.user_id, user: users[req.session.user_id], urls: usersURLs, error: false};
    res.render('urls_index', templateVars);
  } else {
    //If not in session, render template that prompts user to make an account/login
    let templateVars = {id: req.session.user_id, user: users[req.session.user_id], urls: usersURLs, error: false};
    res.render('emptyURL', templateVars);
  }
});


app.post("/urls", (req, res) => {
  //Store the new long URL in the database with a randomly generated short URL
  let randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/:${randomString}`);
});


//Load page to create a new URL
app.get("/urls/new", (req, res) => {

  //Check to see if the user has a cookie
  if (req.session.user_id) {
    let templateVars = { id: req.session.user_id, user: users[req.session.user_id], error: false};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }

});

app.get("/urls/:shortURL", (req, res) => {
  //Checks the database to see if it exists
  if (urlDatabase[req.params.shortURL.slice(1)]) {
    if (req.session.user_id) {
      let templateVars = { id: req.session.user_id, user: users[req.session.user_id], shortURL: req.params.shortURL.slice(1), longURL: urlDatabase[req.params.shortURL.slice(1)], error: false};
      res.render("urls_show", templateVars);
    } else {
      res.redirect('/urls');
    }
  } else {
    //If the shortURL does not exist, go to error page
    res.redirect('/urls/:shortURL/error');
  }
});

//Override Method for deleting a link from the list

app.delete("/urls/:shortURL", (req, res) => {
  
  if (req.session.user_id) {
    if (req.params.shortURL[0] === ':') {
      delete urlDatabase[req.params.shortURL.slice(1)];
    } else {
      delete urlDatabase[req.params.shortURL];
    }
  } else {
    res.send("Don't have permission to delete.");
  }

  res.redirect("/urls/");
});

//When there is an error redirect the page and show error
app.get("/urls/:shortURL/error", (req, res) => {

  let templateVars = { id: req.session.user_id, user: users[req.session.user_id], shortURL: req.params.shortURL.slice(1), longURL: urlDatabase[req.params.shortURL.slice(1)], error: true };

  res.render('emptyURL', templateVars);
});

//When the shortURL is clicked on, redirect to that URL
app.get("/u/:shortURL", (req, res) => {

  let newURL = "";
  let templateVars = {};
  
  if (req.params.shortURL[0] === ':') {
    
    newURL = urlDatabase[req.params.shortURL.slice(1)];
    templateVars = { id: req.session.user_id, user: users[req.session.user_id], shortURL: req.params.shortURL.slice(1), longURL: urlDatabase[req.params.shortURL.slice(1)], error: false};
    res.redirect(newURL, templateVars);
  } else {
      
    newURL = urlDatabase[req.params.shortURL];
    templateVars = { id: req.session.user_id, user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], error: false};
    res.redirect(newURL, templateVars);
  }

});

//When you edit an existing URL
app.post("/urls/:shortURL/checkEdit", (req, res) => {
 
  //Check to see if the shortURL param comes with a : or not and then store it in the longURL
  if (req.params.shortURL[0] === ':') {
    urlDatabase[req.params.shortURL.slice(1)].longURL = req.body.longURL;
   
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }


  res.redirect("/urls/");
});


//Login

app.get("/login", (req, res) => {
  let templateVars = { id: req.session.user_id, user: users[req.session.user_id], error: false };
  res.render("signInPage", templateVars);
});

app.post("/login", (req, res) => {

  //Helper function checks if user is authenticated based on form inputs
  if (checkUserAuthentication(req.body.email, req.body.password, users)) {
    req.session.user_id = getUserIDByEmail(req.body.email, users);
    
  } else {
    res.status(403);
  }

  let accountExists = checkIfUserExists(req.body.email, users);
  
  if (!accountExists) {
    res.status(403);
  }

  res.redirect("/urls/");
});


//When you logout the session assigned null
app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect("/urls/");
});

//Register

app.get("/register", (req, res) => {
  let templateVars = { id: req.session.user_id, user: users[req.session.user_id], error: false};
  res.render("registrationPage", templateVars);
});

//Assigns new user to database
app.post("/register", (req, res) => {

  //Check if the user is already an existing member
  let copy = checkIfUserExists(req.body.email, users);
 

  if (copy === true) {
    console.log("That is a copy!");
    res.status(403);
  } else {

    //Create a new user in the database
    let newID = generateRandomString();
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPassword
    };
  }

  res.redirect("/login");
});

