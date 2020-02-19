const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

//Data

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
  }
};


//Functions

//MAKE THIS USE DIGITS TOO!!
//AAAAAAAAAAAAA
const generateRandomString = function() {
  let randomString = "";
  let alphabet = "abcdefghijklmnopqrstuvwxyz";
  
  for (let i = 0; i < 6; i++) {
    let randomNumb =  Math.floor(Math.random() * 26);

    randomString += alphabet[randomNumb];
  }

  return randomString;
};

const urlsForUser = function(id) {
  let listOfURL = [];

  for (let i = 0; i < Object.keys(urlDatabase).length; i++) {
    if (urlDatabase[Object.keys(urlDatabase)[i]].userID === id) {
      listOfURL.push({shortURL: Object.keys(urlDatabase)[i], longURL: urlDatabase[Object.keys(urlDatabase)[i]].longURL});
    }
  }

  return listOfURL;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => { 
  let usersURLs = [];

  if (req.cookies["id"]) {
    usersURLs = urlsForUser(req.cookies["id"]);
  }
  
  let templateVars = {id: req.cookies["id"], user: users[req.cookies["id"]], urls: usersURLs };
  
  if (req.cookies["id"]) {
    res.render('urls_index', templateVars);
  } else {
    res.render('emptyURL', templateVars);
  }
 
  
});

app.post("/urls", (req, res) => {
  //Store the new long URL in the database with a randomly generated short URL
  let randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.cookies["id"]};
  res.redirect(`/urls/:${randomString}`);
});

app.get("/urls/new", (req, res) => {

  if (req.cookies["id"]) {
    let templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]]};
    res.render("urls_new", templateVars);
  } else {

    res.redirect('/login');
  }

});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["id"]) {
  let templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL.slice(1)] };
  
  res.render("urls_show", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {

  console.log("hello");
  let newURL = "";
  let templateVars = {};
  

    if (req.params.shortURL[0] === ':') {
    
      newURL = urlDatabase[req.params.shortURL.slice(1)];
      templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]], shortURL: req.params.shortURL.slice(1), longURL: urlDatabase[req.params.shortURL.slice(1)]};
      res.redirect(newURL, templateVars);
    } else {
      
      newURL = urlDatabase[req.params.shortURL];
      templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
      res.redirect(newURL, templateVars);
    }

});

//Deletes a shortURL from the list
app.post("/urls/:shortURL/delete", (req, res) => {
 
  if (req.params.shortURL[0] === ':') {
    delete urlDatabase[req.params.shortURL.slice(1)];
  } else {
    delete urlDatabase[req.params.shortURL];
  }


  res.redirect("/urls/");
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
  let templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]] };
  res.render("signInPage", templateVars);
});

app.post("/login", (req, res) => {

  let accountExists = false;

  for (let i = 0; i < Object.keys(users).length; i++) {
  //Checking to make sure the email and password match the database
    if (users[Object.keys(users)[i]].email === req.body.email) {
      accountExists = true;
      if (req.body.password === users[Object.keys(users)[i]].password) {
      //Create a cookie
        res.cookie("id", users[Object.keys(users)[i]].id);
        break;
      } else {
        res.status(403);
        break;
      }
    }
  }

  if (!accountExists) {
    res.status(403);
  }

  res.redirect("/urls/");
});

//When you click the logout button it signs you out by deleting cookie
app.post("/logout", (req, res) => {

  res.clearCookie("id");

  res.redirect("/urls/");
});

//Register

app.get("/register", (req, res) => {
  let templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]], };
  res.render("registrationPage", templateVars);
});


app.post("/register", (req, res) => {

  let copy = false;
  for (let i = 0; i < Object.keys(users).length; i++) {
    if (req.body.email === users[Object.keys(users)[i]].email) {
      copy = true;
    }
  }

  if (copy === true) {
    console.log("That is a copy!");
    res.status(403);
  } else {
    let newID = generateRandomString();

    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    };
  }
  

  res.redirect("/login");
});

