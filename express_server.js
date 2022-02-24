const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const req = require('express/lib/request');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

// url data
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "exampleID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "exampleID"
  }
};

// user data
const users = { 
  "exampleID": {
    id: "exampleID", 
    email: "user@example.com", 
    password: "password"
  },
}

app.get('/', (req, res) => {
  res.send('Hello!');
});

// load register page
app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, userId: users[req.cookies['user_id']] };
  // redirect if user is logged in
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  res.render('urls_register', templateVars);
});

// handle posts from /register
app.post('/register', (req, res) => {
  const randId = generateRandomString();
  // check if inputs are blank
  if (req.body['email'] === '' || req.body['password'] === '') {
    return res.sendStatus(400);
  }

  // check if email is in use already
  const email = req.body['email'];
  if (checkEmailExists(email) !== false) {
    return res.sendStatus(400);
  }

  //console.log('before adding', users);
  if (req.body['email'])
  users[randId] = {
    id: randId,
    email: req.body['email'],
    password: req.body['password']
  };
  //console.log('after adding', users);
  res.cookie('user_id', randId);
  res.redirect('/urls');
});

// login get
app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase, userId: users[req.cookies['user_id']] };
  res.render('urls_login', templateVars);
});

// login post
app.post('/login', (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];
  const emailCheck = checkEmailExists(email);
  if (emailCheck === false) {
    return res.sendStatus(403);
  }
  if (password !== users[emailCheck]['password']) {
    return res.sendStatus(403);
  }

  res.cookie('user_id', emailCheck);
  res.redirect('/urls');
});

// logout post
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// render urls page
app.get('/urls', (req, res) => {

  if (!req.cookies['user_id']) {
    return res.send('<a href="/login"><button>Please log in</button></a>');
  }

  const uId = req.cookies['user_id'];
  let filteredUrls = urlsForUser(uId);

  const templateVars = { urls: filteredUrls, userId: users[req.cookies['user_id']] };
  res.render('urls_index', templateVars);
});

// add new url
app.post('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send('Error: user not logged in');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body['longURL'] };
  urlDatabase[shortURL]['userID'] = req.cookies['user_id'];
  res.redirect('/urls/' + shortURL);
});

// render new url page
app.get('/urls/new', (req, res) => {
  // redirect if user is not logged in
  if (!req.cookies['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = { userId: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
});

// delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send('Error: must be logged in to delete a URL');
  }

  const uId = req.cookies['user_id'];
  let filteredUrls = urlsForUser(uId);
  if (!(req.params.shortURL in filteredUrls)) {
    return res.send('Error: could not find ' + req.params.shortURL + ' in your account');
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// update url
app.post('/urls/:shortURL/update', (req, res) => {

  if (!req.cookies['user_id']) {
    return res.send('Error: must be logged in to update a URL');
  }

  const uId = req.cookies['user_id'];
  let filteredUrls = urlsForUser(uId);
  if (!(req.params.shortURL in filteredUrls)) {
    return res.send('Error: could not find ' + req.params.shortURL + ' in your account');
  }

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]['longURL'] = req.body['longURL'];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  if (!(req.params.shortURL in urlDatabase)) {
    return res.send("Error: short URL '" + req.params.shortURL + "' not found");
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

// render the urls_show page
app.get('/urls/:shortURL', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send('Error: user not logged in');
  }

  const uId = req.cookies['user_id'];
  let filteredUrls = urlsForUser(uId);
  if (!(req.params.shortURL in filteredUrls)) {
    return res.send('Error: could not find ' + req.params.shortURL + ' in your account');
  }
  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], userId: users[req.cookies['user_id']] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generate a random 6-digit alpha numeric string 
function generateRandomString() {
  const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const stringLength = 6;
  let outputString = '';
  for (let i = 0; i < stringLength; i++) {
    outputString += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  return outputString;
}

// check if an email exists and return the user_id if found
const checkEmailExists = function(email) {
  for (const user in users) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
  return false;
};

//
const urlsForUser = function(id) {
  // const uId = req.cookies['user_id'];
  let filteredUrlDatabase = {};
  for(const url in urlDatabase) {
    if(urlDatabase[url]['userID'] === id) {
      filteredUrlDatabase[url] = { ...urlDatabase[url] };
    }
  }
  return filteredUrlDatabase;
};
