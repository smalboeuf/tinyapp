const { assert } = require('chai');

//Run npm test

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', () => {
  it("should return the appropriate user based on email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it("should return undefined if it can't find a user with that email", () => {
    const user = getUserByEmail("monkey@example", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
