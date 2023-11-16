const fs = require('fs')

function getContentRange ({ filePath, range }) {
  const videoSize = fs.statSync(filePath).size
  const chunkSize = 1 * 1e6  //  1MB
  const start = Number(range.replace(/\D/g, ""))
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1

  return { start, end, videoSize, contentLength }
}

function getMediaStreamHeaders ({ start, end, videoSize, contentLength, fileType }) {
  return {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": fileType === 'mp4' ? 'video/mp4' : 'audio/mpeg',
  }
}

function getFileTypeByExtension (filePath) {
  const splittedFilePath = filePath.split('.')

  return splittedFilePath[splittedFilePath.length - 1] === 'mp4' ? 'mp4' : 'mp3'
}

module.exports = {
  getContentRange,
  getMediaStreamHeaders,
  getFileTypeByExtension
}