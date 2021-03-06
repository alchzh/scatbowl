import { randomBytes } from 'crypto'

export default function randomGuestID (byteLength) {
  return new Promise((resolve, reject) => {
    randomBytes(byteLength, (err, buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve(buffer.toString('hex'))
      }
    })
  })
}
