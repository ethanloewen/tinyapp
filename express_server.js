const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  res.redirect('/urls/' + shortURL);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new');
});

// delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  console.log('DB before delete', urlDatabase);
  delete urlDatabase[req.params.shortURL];
  console.log('DB after delete', urlDatabase);
  res.redirect('/urls');
});

// update url
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);
});

// login
app.post('/login', (req, res) => {
  res.cookie('username', req.body['username']);
  res.redirect('/urls');
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
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