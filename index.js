const fs = require('fs')
const http = require('http')
const express = require("express")
const socketio = require("socket.io")
const { 
  userJoin,
  getSessionOwner
} = require('./socket/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

function streamMedia (req, res) {
  const range = req.headers.range || "0"
  const videoPath = "./assets/test.mp4"
  const videoSize = fs.statSync(videoPath).size
  const chunkSize = 1 * 1e6  //  1MB
  const start = Number(range.replace(/\D/g, ""))
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  }
  res.writeHead(206, headers)

  const stream = fs.createReadStream(videoPath, { start, end })
  stream.pipe(res)
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/device', function(req, res) {
  res.sendFile(__dirname + '/device.html')
})

app.get('/media', function(req, res) {
  streamMedia(req, res)
})

io.on('connection', (socket) => {
  socket.on('create-session', ({ sessionId, language = 'DEFAULT'}) => {
    socket.join(sessionId)

    userJoin({ sessionId, socketId: socket.id, language, type: 'OWNER' })
  })

  socket.on('join-session', ({ sessionId, language }) => {
    const sessionOwner = getSessionOwner(sessionId)
    if (!sessionOwner) {
      return
    }

    socket.join(sessionId)

    userJoin({ sessionId, socketId: socket.id, language, type: 'VIEWER' })

    io.to(sessionOwner.socketId).emit('viewer-joined', { language })
  })
})


server.listen(8080, function () {
  console.log('server running on port 8080')
})