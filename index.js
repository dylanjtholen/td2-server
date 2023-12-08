const httpServer = require("http").createServer()
const { initGame, updateGame } = require("./game")
const {checkPlacement, towerConstants} = require("./utils")
let tower = require("./classes/tower.js")
let enemy = require("./classes/enemy.js")
let projectile = require("./classes/projectile")
const rounds = require("./classes/rounds")
const io = require("socket.io")(httpServer, {
    cors: {
      origin: "https://laughing-train-p5wx56rqgjq3rpx7-5504.app.github.dev",
      methods: ["GET", "POST"]
    }
  })

function makeid(length) {
  let characters = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

const socketrooms = io.of("/").adapter.rooms
const socketsids = io.of("/").adapter.sids

const maxplayers = 4

const rooms = {}
const state = {}

io.on('connection', (client) => {
  client.on('joinroom', (roomname) => {
    if (!socketrooms.has(roomname) || state[roomname].started) {
      client.emit('roomnotfound')
      return
    }
    if (socketrooms.get(roomname).size >= maxplayers) {
      client.emit('roomfull')
      return
    }

    client.join(roomname)
    rooms[client.id] = roomname
    state[roomname].players[socketrooms.get(roomname).size] = {money: 250}
    client.playerid = socketrooms.get(roomname).size
    client.emit('joinedroom', {roomname: roomname, playerid: socketrooms.get(roomname).size})
  })

  client.on('createroom', () => {
    let roomname = makeid(5)
    while (socketrooms.has(roomname)) {
      roomname = makeid(5)
    }
    client.join(roomname)
    rooms[client.id] = roomname
    client.playerid = socketrooms.get(roomname).size
    client.emit('joinedroom', {roomname: roomname, playerid: socketrooms.get(roomname).size})
    state[roomname] = initGame()
  })
  client.on('startgame', () => {
    if (!rooms[client.id]) return
    let roomname = rooms[client.id]
    if (socketrooms.get(roomname).size < 1) {client.emit('notenoughplayers'); return}
    io.to(roomname).emit('gamestarted')
    startInterval(roomname)
  })
  client.on('leavegame', () => {
    if (!rooms[client.id]) return
    let roomname = rooms[client.id]
    client.leave(roomname)
    delete rooms[client.id]
  })
  client.on('placetower', (towerinfo) => {
    if (!rooms[client.id]) return
    let roomname = rooms[client.id]
    let gamestate = state[roomname]
    let player = gamestate.players[client.playerid]
    if (player.money >= towerConstants[towerinfo.type].cost && checkPlacement(towerinfo.x, towerinfo.y, towerConstants[towerinfo.type].size, gamestate)) {
      gamestate.towers.push(new tower(towerinfo.type, towerinfo.x, towerinfo.y, client.playerid))
      gamestate.players[client.playerid].money -= towerConstants[towerinfo.type].cost
    }
  })
  client.on('selltower', (towerinfo) => {
    if (!rooms[client.id]) return
    let roomname = rooms[client.id]
    let gamestate = state[roomname]
    for (let i in gamestate.towers) {
      let tow = gamestate.towers[i]
      if (tow.x == towerinfo.x && tow.y == towerinfo.y && tow.owner == client.playerid) {
        tow.sell(gamestate)
        break
      }
    }
  })
  client.on('startround', () => {
    if (!rooms[client.id]) return
    let roomname = rooms[client.id]
    state[roomname].roundRunning = true
  })
  client.on('toggleautostart', () => {
    if (!rooms[client.id]) return
    let roomname = rooms[client.id]
    state[roomname].autostart = !state[roomname].autostart
  })
})

function startInterval(roomname) {
  state[roomname].started = true
  let interval = setInterval(() => {
    if (!socketrooms.get(roomname) || socketrooms.get(roomname).size < 1) {
      clearInterval(interval)
      return
    }
    state[roomname] = updateGame(state[roomname])
    io.to(roomname).emit('state', state[roomname])
  }, 1000 / 60)
}

httpServer.listen(3000)