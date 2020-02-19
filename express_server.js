const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const generateRandomString = function() {
  let randomString = "";
  let alphabet = "abcdefghijklmnopqrstuvwxyz";
  
  for (let i = 0; i < 6; i++) {
    let randomNumb =  Math.floor(Math.random() * 26);

    randomString += alphabet[randomNumb];
  }

  return randomString;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {id: req.cookies["id"], user: users[req.cookies["id"]], urls: urlDatabase };
  res.render('urls_index', templateVars);
  
});

app.post("/urls", (req, res) => {
  //Store the new long URL in the database with a randomly generated short URL
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/:${randomString}`);
});

app.get("/urls/new", (req, res) => {

  
  console.log(req.cookies["id"]);
  if (req.cookies["id"]) {
    let templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]]};
    res.render("urls_new", templateVars);
  } else {

    res.redirect('/login');
  }

});

app.get("/urls/:shortURL", (req, res) => {
  
  let templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL.slice(1)] };
  
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

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
 

  if (req.params.shortURL[0] === ':') {
    urlDatabase[req.params.shortURL.slice(1)] = req.body.longURL;
   
  } else {
    urlDatabase[req.params.shortURL] = req.body.longURL;
  }


  res.redirect("/urls/");
});






//Login

app.get("/login", (req, res) => {
  console.log(users[req.cookies["id"]]);
  templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]] };
  res.render("signInPage", templateVars);
});

app.post("/login", (req, res) => {

  let accountExists = false;

 for (let i = 0; i < Object.keys(users).length; i++) {
  //Checking to make sure the email and password match the database
  if (users[Object.keys(users)[i]].email === req.body.email){
    accountExists = true;
    if(req.body.password === users[Object.keys(users)[i]].password) {
      //Create a cookie
      res.cookie("id", users[Object.keys(users)[i]].id);
      break;
    } else {
      res.status(403);
      break;
    }
  }
 }

 if(!accountExists) {
  res.status(403);
 }
 let templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]]}

  res.redirect("/urls/");
});

//When you click the logout button it signs you out by deleting cookie
app.post("/logout", (req, res) => {

  res.clearCookie("id");

  res.redirect("/urls/")
});

//Register

app.get("/register", (req, res) => {
  templateVars = { id: req.cookies["id"], user: users[req.cookies["id"]], };
  res.render("registrationPage", templateVars);
});


app.post("/register", (req, res) => {

  let copy = false;
  for (let i = 0; i < Object.keys(users).length; i++) {
    if (req.body.email === users[Object.keys(users)[i]].email) {
      copy = true;
    }
  }

  if(copy === true) {
    console.log("That is a copy!");
    res.status(403);
  } else { 
    let newID = generateRandomString();

    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    }
  }
  

  res.redirect("/login");
});