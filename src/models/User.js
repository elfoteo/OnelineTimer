// User.js
const Timer = require('./Timer.js');

class User {
  constructor(username) {
    this.username = username;
    this.timers = [];
  }

  addTimer(timer) {
    this.timers.push(timer);
  }
}

module.exports = User;