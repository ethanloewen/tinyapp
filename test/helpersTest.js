const { assert } = require('chai');

const { getUserByEmail, getUrlsForUser, generateRandomString } = require('../helpers');

describe('getUserByEmail', () => {
  const testUsers = {
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

  it('should return a user with a valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined with an invalid email', () => {
    const user = getUserByEmail('invalid@example.com', testUsers);
    assert.strictEqual(user, undefined);
  });
});

describe('getUrlsForUser', () => {
  const testUrlDatabase = {
    "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "exampleID1"
    },
  
    "9sm5xK": {
      longURL: "http://www.google.com",
      userID: "exampleID2"
    }
  };

  it('should return all objects with URLs associated with a user id', () => {
    const urls = getUrlsForUser('exampleID1', testUrlDatabase);
    const expectedUrls = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "exampleID1"
      }
    };
    assert.deepEqual(urls, expectedUrls);
  });

  it('should return an empty object when there are no associated URLs', () => {
    const urls = getUrlsForUser('exampleID3', testUrlDatabase);
    const expectedUrls = {};
    assert.deepEqual(urls, expectedUrls);
  });
});

describe('generateRandomString', () => {
  it('should return a 6 character long string', () => {
    const randomString = generateRandomString();
    assert.strictEqual(randomString.length, 6);
  });

  it('should return a unique string each time', () => {
    const randomString1 = generateRandomString();
    const randomString2 = generateRandomString();
    assert.notStrictEqual(randomString1, randomString2);
  });
});