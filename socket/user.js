const users = []

const userJoin = (user) => {
  users.push(user)
}

const getSessionOwner = (sessionId) =>
  users.find(user => user.sessionId === sessionId && user.type === 'OWNER')

module.exports = {
  userJoin,
  getSessionOwner
}