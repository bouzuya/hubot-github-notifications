# Description
#   A Hubot script that returns github notifications
#
# Configuration:
#   HUBOT_GITHUB_NOTIFICATIONS_INTERVAL
#   HUBOT_GITHUB_NOTIFICATIONS_ROOM
#   HUBOT_GITHUB_NOTIFICATIONS_TOKEN
#
# Commands:
#   None
#
# Author:
#   bouzuya <m@bouzuya.net>
#
module.exports = (robot) ->
  request = require 'request-b'
  table = require 'text-table'

  INTERVAL = process.env.HUBOT_GITHUB_NOTIFICATIONS_INTERVAL ? '60000'
  TOKEN = process.env.HUBOT_GITHUB_NOTIFICATIONS_TOKEN
  ROOM = process.env.HUBOT_GITHUB_NOTIFICATIONS_ROOM

  notifications = {}

  polling = ->
    setTimeout ->
      request
        method: 'GET'
        url: 'https://api.github.com/notifications'
        qs:
          access_token: TOKEN
        headers:
          'User-Agent': 'hubot-github-notifications'
      .then (r) ->
        ns = JSON.parse r.body
        news = ns.filter (n) -> !notifications[n.id]
        return unless news.length > 0
        news.forEach (n) ->
          notifications[n.id] = true
        robot.messageRoom ROOM, table(news.map (n) ->
          [n.id, n.repository.full_name, n.subject.title]
        )
      .then polling, polling
    , parseInt(INTERVAL, 10)

  polling()
