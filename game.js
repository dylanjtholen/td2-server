const tower = require('./classes/tower.js')
const enemy = require('./classes/enemy.js')
const projectile = require('./classes/projectile.js')
const rounds = require('./classes/rounds.js')
const { towerConstants } = require('./utils.js')
  
function roundEnd(game) {
    game.roundRunning = game.autostart;
    game.enemyCooldown = 0;
    game.roundIndex = 0;
    game.round++;
    for (const [key, value] of Object.entries(game.players)) {
    value.money += Math.ceil((100 + game.round * 5) / Math.ceil(Object.entries(game.players).length / 2))
    }
      game.projectiles = []
    for (let i in game.towers) {
      game.towers[i].cooldown = 0
    }
  }

  function spawnEnemies(game) {
      if (game.round > rounds.length - 1) {game.win = true; return}
      if (game.enemies.length <= 0 && game.roundIndex >= rounds[game.round].length) {roundEnd(game);return}
      if (!game.roundRunning || game.roundIndex >= rounds[game.round].length) return
      if (game.enemyCooldown > 0 && game.enemies.length > 0) {
          game.enemyCooldown--
          return
      }
      game.enemyCooldown = 60
      game.enemies.push(new enemy(rounds[game.round][game.roundIndex], '', game))
      game.roundIndex++
      
  }

function initGame() {
    return {
        health: 100,
        players: {
            1: {money: 250}
        },
        towers: [],
        enemies: [],
        projectiles: [],
        round: 1,
        roundIndex: 0,
        roundRunning: false,
        autostart: false,
        enemyCooldown: 0,
        map: 'easy',
        enemyidcounter: 0
        }
}

function updateGame(game) {
    for (let tower of game.towers) tower.update(game)
    for (let enemy of game.enemies) enemy.update(game)
    for (let projectile of game.projectiles) projectile.update(game)
    spawnEnemies(game)
    return game
}

module.exports = {
    initGame,
    updateGame
}