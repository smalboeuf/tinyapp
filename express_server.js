const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  //Store the new long URL in the database with a randomly generated short URL
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/:${randomString}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL.slice(1)] };
  
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

  let newURL = "";
  let templateVars = {};
  
  if (req.params.shortURL[0] === ':') {
    
    newURL = urlDatabase[req.params.shortURL.slice(1)];
    templateVars = {shortURL: req.params.shortURL.slice(1), longURL: urlDatabase[req.params.shortURL.slice(1)]};
    res.redirect(newURL, templateVars);
  } else {
    
    newURL = urlDatabase[req.params.shortURL];
    templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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
 
  
  console.log("shortURL", req.params.shortURL);

  if (req.params.shortURL[0] === ':') {
    urlDatabase[req.params.shortURL.slice(1)] = req.body.longURL; 
   
  } else {
    urlDatabase[req.params.shortURL] = req.body.longURL;
  }


  res.redirect("/urls/");
});