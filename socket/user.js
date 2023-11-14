const users = []

const userJoin = (user) => {
  users.push(user)
}

const getSessionOwner = (sessionId) =>
  users.find(user => user.sessionId === sessionId && user.type === 'OWNER')

const getUserBySocketId = (socketId) =>
  users.find(user => user.socketId === socketId)

module.exports = {
  userJoin,
  getSessionOwner,
  getUserBySocketId
}