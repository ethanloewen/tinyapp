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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// user data
const users = { 
  "default": {
    id: "exampleID", 
    email: "user@example.com", 
    password: "example-password"
  },
}

// return the user_id's object if the cookie exists
// const getUserId = () => {
//   if(req.cookies['user_id']) {
//     return users[user_id];
//   }
//   return 'default';
// };


app.get('/', (req, res) => {
  res.send('Hello!');
});

// load register page
app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies['user_id']] };
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
  for (const user in users) {
    if (users[user]['email'] === req.body['email']) {
      return res.sendStatus(400);
    }
  }

  console.log('before adding', users);
  if (req.body['email'])
  users[randId] = {
    id: randId,
    email: req.body['email'],
    password: req.body['password']
  };
  console.log('after adding', users);
  res.cookie('user_id', randId);
  res.redirect('/urls');
});

// login page
app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies['user_id']] };
  res.render('urls_login', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies['user_id']] };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  res.redirect('/urls/' + shortURL);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: users[req.cookies['user_id']] };
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
  res.redirect('/urls/' + shortURL);
});

// login
app.post('/login', (req, res) => {
  res.cookie('username', users);
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: users[req.cookies['user_id']] };
  res.render('urls_show', templateVars);
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

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