const express = require('express');
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcryptjs');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['testkey'],
  maxAge: 24 * 60 * 60 * 1000
}));

// import helper functions
const { getUserByEmail, getUrlsForUser, generateRandomString } = require('./helpers');

// url database
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

// user database
const users = {
  "exampleID": {
    id: "exampleID",
    email: "user@example.com",
    password: bcrypt.hashSync('pass', 10)
  }
};

// ---/register---
app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, userId: users[req.session.user_id] };
  // redirect if user is logged in
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const randId = generateRandomString();
  // check if inputs are blank
  if (req.body['email'] === '' || req.body['password'] === '') {
    return res.status(400).send('<h3>Email or password was left empty - please try again</h3>');
  }

  // check if email is in use already
  const email = req.body['email'];
  if (getUserByEmail(email, users)) {
    return res.status(400).send('<h3>Email already in use - please try again</h3>');
  }

  users[randId] = {
    id: randId,
    email: req.body['email'],
    password: bcrypt.hashSync(req.body['password'], 10)
  };
  req.session.user_id = randId;
  res.redirect('/urls');
});

// ---/login---
app.get('/login', (req, res) => {
  // redirect if user is logged in
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  const templateVars = { urls: urlDatabase, userId: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];
  const emailCheck = getUserByEmail(email, users);
  if (!emailCheck) {
    return res.status(403).send('<h3>There was an error logging in - check your spelling</h3>');
  }
  
  if (!bcrypt.compareSync(password, users[emailCheck]['password'])) {
    return res.status(403).send('<h3>There was an error logging in - check your spelling</h3>');
  }

  req.session.user_id = emailCheck;
  res.redirect('/urls');
});

// ---/logout---
app.post('/logout', (req, res) => {
  // clear cookies
  req.session = null;
  res.redirect('/urls');
});

// ---/urls---
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.send('<h3 style="display: inline; margin-right: 15px;">Error: User not logged in</h3><a href="/login" style="display: inline"><button>Please log in</button></a>');
  }

  const uId = req.session.user_id;
  let filteredUrls = getUrlsForUser(uId, urlDatabase);

  const templateVars = { urls: filteredUrls, userId: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.send('Error: user not logged in');
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body['longURL'] };
  urlDatabase[shortURL]['userID'] = req.session.user_id;
  res.redirect('/urls');
});

// ---/urls/new---
app.get('/urls/new', (req, res) => {
  // redirect if user is not logged in
  if (!req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = { userId: users[req.session.user_id] };
  res.render('urls_new', templateVars);
});

// ---/urls/:shortURL/delete---
app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.send('Error: must be logged in to delete a URL');
  }

  const uId = req.session.user_id;
  let filteredUrls = getUrlsForUser(uId, urlDatabase);
  if (!(req.params.shortURL in filteredUrls)) {
    return res.send('Error: could not find ' + req.params.shortURL + ' in your account');
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// ---/urls/:shortURL/update---
app.post('/urls/:shortURL/update', (req, res) => {
  if (!req.session.user_id) {
    return res.send('Error: must be logged in to update a URL');
  }

  const uId = req.session.user_id;
  let filteredUrls = getUrlsForUser(uId, urlDatabase);
  if (!(req.params.shortURL in filteredUrls)) {
    return res.send('Error: could not find ' + req.params.shortURL + ' in your account');
  }

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]['longURL'] = req.body['longURL'];
  res.redirect('/urls');
});

// ---/u/:shortURL---
app.get('/u/:shortURL', (req, res) => {
  if (!(req.params.shortURL in urlDatabase)) {
    return res.send("Error: short URL '" + req.params.shortURL + "' not found");
  }
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

// ---/urls/:shortURL---
app.get('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) {
    return res.send('Error: user not logged in');
  }

  if (!(req.params.shortURL in urlDatabase)) {
    return res.send('Error: The URL ' + req.params.shortURL + ' does not exists');
  }

  const uId = req.session.user_id;
  let filteredUrls = getUrlsForUser(uId, urlDatabase);
  if (!(req.params.shortURL in filteredUrls)) {
    return res.send('Error: The URL \'' + req.params.shortURL + '\' is not linked to your account');
  }
  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], userId: users[req.session.user_id] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
