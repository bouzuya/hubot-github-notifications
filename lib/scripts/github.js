// Description
//   A Hubot script that returns github notifications
//
// Configuration:
//   HUBOT_GITHUB_NOTIFICATIONS_INTERVAL
//   HUBOT_GITHUB_NOTIFICATIONS_ROOM
//   HUBOT_GITHUB_NOTIFICATIONS_TOKEN
//
// Commands:
//   None
//
// Author:
//   bouzuya <m@bouzuya.net>
//
module.exports = function(robot) {
  var INTERVAL, ROOM, TOKEN, notifications, polling, request, table, _ref;
  request = require('request-b');
  table = require('text-table');
  INTERVAL = (_ref = process.env.HUBOT_GITHUB_NOTIFICATIONS_INTERVAL) != null ? _ref : '60000';
  TOKEN = process.env.HUBOT_GITHUB_NOTIFICATIONS_TOKEN;
  ROOM = process.env.HUBOT_GITHUB_NOTIFICATIONS_ROOM;
  notifications = {};
  polling = function() {
    return setTimeout(function() {
      return request({
        method: 'GET',
        url: 'https://api.github.com/notifications',
        qs: {
          access_token: TOKEN
        },
        headers: {
          'User-Agent': 'hubot-github-notifications'
        }
      }).then(function(r) {
        var news, ns;
        ns = JSON.parse(r.body);
        news = ns.filter(function(n) {
          return !notifications[n.id];
        });
        if (!(news.length > 0)) {
          return;
        }
        news.forEach(function(n) {
          return notifications[n.id] = true;
        });
        return robot.messageRoom(ROOM, table(news.map(function(n) {
          return [n.id, n.repository.full_name, n.subject.title];
        })));
      }).then(polling, polling);
    }, parseInt(INTERVAL, 10));
  };
  return polling();
};
