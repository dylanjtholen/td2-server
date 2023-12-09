const httpServer = require("http").createServer()
const { initGame, updateGame } = require("./game")
const {checkPlacement, towerConstants, upgrades} = require("./utils")
let tower = require("./classes/tower.js")
let enemy = require("./classes/enemy.js")
let projectile = require("./classes/projectile")
const rounds = require("./classes/rounds")
const { info } = require("console")
const io = require("socket.io")(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST"]
    }
  })
  console.log("Server started")

function makeid(length) {
  let characters = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

function validateusername(username) {
  if (username.length > 20 || username.length < 1) return false
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_'
  for (let i = 0; i < username.length; i++) {
    if (!characters.includes(username.charAt(i))) return false
  }
  return true
}

const socketrooms = io.of("/").adapter.rooms

const maxplayers = 4

const rooms = {}
const state = {}

io.on('connection', (client) => {
  client.on('joinroom', (info) => {
    if (!validateusername(info.username)) {
      client.emit('invalidusername')
      return
    }
    if (!socketrooms.has(info.roomname) || state[info.roomname].started) {
      client.emit('roomnotfound')
      return
    }
    if (socketrooms.get(info.roomname).size >= maxplayers) {
      client.emit('roomfull')
      return
    }

    client.join(info.roomname)
    rooms[client.id] = info.roomname
    state[info.roomname].players[socketrooms.get(info.roomname).size] = {money: 250, username: info.username}
    client.playerid = socketrooms.get(info.roomname).size
    client.emit('joinedroom', {roomname: info.roomname, playerid: socketrooms.get(info.roomname).size, players: state[info.roomname].players})
    io.to(info.roomname).emit('roomupdate', {players: state[info.roomname].players, roomname: info.roomname, state: state[info.roomname]})
  })

  client.on('createroom', (info) => {
    if (!validateusername(info.username)) {
      client.emit('invalidusername')
      return
    }
    let roomname = makeid(5)
    while (socketrooms.has(roomname)) {
      roomname = makeid(5)
    }
    client.join(roomname)
    rooms[client.id] = roomname
    client.playerid = 1
    state[roomname] = initGame()
    state[roomname].players[1] = {money: 250, username: info.username + '(host)'}
    client.emit('joinedroom', {roomname: roomname, playerid: socketrooms.get(roomname).size, players: state[roomname].players})
  })
  client.on('previousmap', () => {
    if (!rooms[client.id] || client.playerid != 1) return
    let roomname = rooms[client.id]
    let gamestate = state[roomname]
    gamestate.map = gamestate.map == 'easy' ? 'hard' : gamestate.map == 'hard' ? 'medium' : 'easy'
    io.to(roomname).emit('roomupdate', {players: state[roomname].players, roomname: roomname, state: gamestate})
  })
  client.on('nextmap', () => {
    if (!rooms[client.id] || client.playerid != 1) return
    let roomname = rooms[client.id]
    let gamestate = state[roomname]
    gamestate.map = gamestate.map == 'easy' ? 'medium' : gamestate.map == 'medium' ? 'hard' : 'easy'
    io.to(roomname).emit('roomupdate', {players: state[roomname].players, roomname: roomname, state: gamestate})
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
  client.on('buyupgrade', (info) => {
    if (!rooms[client.id]) return
    let gamestate = state[rooms[client.id]]
    let index = info.index
    let tower
    for (let i in gamestate.towers) {
      let tow = gamestate.towers[i]
      if (tow.x == info.tower.x && tow.y == info.tower.y && tow.type == info.tower.type && tow.owner == client.playerid) {
        tower = tow
        break
      }
    }
    if (!tower) return
    console.log(tower.x, tower.y, tower.type, tower.owner)
    let upgrade = upgrades[tower.type][info.index-1]
    if (upgrade.cost > gamestate.players[client.playerid].money) return
    if ((index-4>-1 && !tower.upgrades[index-4]) || (index == 7 && (!tower.upgrades[index-2] || !tower.upgrades[index-3] || !tower.upgrades[index-4]))) return
    gamestate.players[client.playerid].money -= upgrade.cost
    tower.upgrades[index-1] = upgrade
    tower.updateUpgrades()
    client.emit('upgradebought', tower)
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