const fs = require('fs')
const http = require('http')
const express = require("express")
const socketio = require("socket.io")
const { 
  userJoin,
  getSessionOwnerBySessionId,
  getUserBySocketId,
  removeUsersByPropertyAndValue
} = require('./socket/user')
const {
  getContentRange,
  getMediaStreamHeaders,
  getFileTypeByExtension
} = require('./utils/media-mananger')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

function streamMedia (req, res, filePath) {
  const range = req.headers.range || '0'

  const contentRange = getContentRange({ filePath, range })
  
  res.writeHead(206, getMediaStreamHeaders({...contentRange, fileType: getFileTypeByExtension(filePath)}))

  const stream = fs.createReadStream(
    filePath, 
    { 
      start: contentRange.start, 
      end : contentRange.end
    }
  )

  stream.pipe(res)
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/device', function(req, res) {
  res.sendFile(__dirname + '/device.html')
})

app.get('/media', function(req, res) {
  streamMedia(req, res, './assets/video.mp4')
})

app.get('/audio/:language', function(req, res) {
  streamMedia(req, res, `./assets/audio-${language}.mp3`)
}) 

io.on('connection', (socket) => {
  socket.on('create-session', ({ sessionId, language = 'DEFAULT', userId }) => {
    socket.join(sessionId)

    userJoin({ sessionId, socketId: socket.id, userId, language, type: 'OWNER' })
  })

  socket.on('join-session', ({ sessionId, language, userId }) => {
    const sessionOwner = getSessionOwnerBySessionId(sessionId)
    if (!sessionOwner) {
      return
    }

    socket.join(sessionId)

    userJoin({ sessionId, socketId: socket.id, userId, language, type: 'VIEWER' })

    io.to(sessionOwner.socketId).emit('viewer-joined', { language, userId })
  })

  socket.on('disconnect', () => {
    const user = getUserBySocketId(socket.id)

    if (!user) {
      return
    }

    if (user.type === 'OWNER') {
      socket.broadcast.to(user.sessionId).emit('session-ended')
      removeUsersByPropertyAndValue('sessionId', user.sessionId)

    } else {
      const sessionOwner = getSessionOwnerBySessionId(user.sessionId)

      io.to(sessionOwner.socketId).emit('viewer-disconnected', { userId: user.userId })
      removeUsersByPropertyAndValue('userId', user.userId)
    }
  })
})


server.listen(8080, function () {
  console.log('server running on port 8080')
})