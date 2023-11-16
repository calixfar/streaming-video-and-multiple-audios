let users = []

const userJoin = (user) => {
  users.push(user)
}

const getSessionOwnerBySessionId = (sessionId) =>
  users.find(user => user.sessionId === sessionId && user.type === 'OWNER')

const getUserBySocketId = (socketId) =>
  users.find(user => user.socketId === socketId)

const removeUsersByPropertyAndValue = (property, id) => {
  users = users.filter(user => user[property] != id)
}

module.exports = {
  userJoin,
  getSessionOwnerBySessionId,
  getUserBySocketId,
  removeUsersByPropertyAndValue
}