// check if an email exists and return the user_id if found. If not found return false
const getUserByEmail = function(email, usersDB) {
  for (const user in usersDB) {
    if (usersDB[user]['email'] === email) {
      return user;
    }
  }
  return undefined;
};

// return all objects with urls that are associated with a user id
const getUrlsForUser = function(id, urlDB) {
  let filteredUrlDatabase = {};
  for (const url in urlDB) {
    if (urlDB[url]['userID'] === id) {
      filteredUrlDatabase[url] = { ...urlDB[url] };
    }
  }
  return filteredUrlDatabase;
};

// generate a random 6-digit alpha numeric string
const generateRandomString = function() {
  const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const stringLength = 6;
  let outputString = '';
  for (let i = 0; i < stringLength; i++) {
    outputString += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  return outputString;
};

module.exports = {
  getUserByEmail,
  getUrlsForUser,
  generateRandomString
};