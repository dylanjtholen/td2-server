const { distance, towerConstants, upgrades } = require('../utils.js')
const projectile = require('./projectile.js')

class tower {
    constructor(type, x, y, owner) {
        this.x = x
        this.y = y
        this.owner = owner
        this.constants = {}
        Object.assign(this.constants, towerConstants[type]);
        this.width = this.constants.size
        this.height = this.constants.size
        this.cooldown = 0
        this.type = type
        this.upgrades = []
        this.rotation = 0
    }
    update(game) {
        if (game.enemies.length > 0) {
        let enemy
        let enemyIndex
        for (let i in game.enemies) {
            if ((!enemy || game.enemies[i].distanceTravelled >= enemy.distanceTravelled) && distance(this.x + this.width / 2, this.y + this.height / 2, game.enemies[i].x, game.enemies[i].y) <= this.constants.range) {enemy = game.enemies[i]; enemyIndex = i}
        }
        if (enemy) {
        let yDistance = enemy.y - (this.y + this.height / 2)
        let xDistance = enemy.x - (this.x + this.width / 2)
        let angle = Math.atan2(yDistance, xDistance)
        this.rotation = angle
        if (this.cooldown > 0) {
            this.cooldown--
        } else {
            if (this.type == 'sniper') {
                game.players[this.owner].money += enemy.health <= this.constants.damage ? enemy.health : this.constants.damage
                enemy.health -= this.upgrades[0] && Math.random() * 10 <= 2 ? this.constants.damage * 3 : this.constants.damage
                enemy.stun = this.upgrades[4] && enemy.stun <= 0 ? 30 : 0
                if (this.upgrades[1]) {
                    this.enemyexclude = enemy
                    for (let i = 1; i < 9; i++) {
                    game.projectiles.push(new projectile('frag', enemy.x, enemy.y, undefined, undefined, i * (Math.PI / 4), this))
                    }
                }
                if (enemy.health <= 0) enemy.delete(game)
                if (this.upgrades[6]) {
                    for (let i = 1; i < 4; i++) {
                        let enemy = game.enemies[enemyIndex + i]
                        if (!enemy) {
                            enemy = game.enemies[enemyIndex - i]
                            if (!enemy) {break}
                        }
                        game.players[this.owner].money += enemy.health <= this.constants.damage ? enemy.health : this.constants.damage
                        enemy.health -= this.upgrades[0] && Math.random() * 10 <= 2 ? this.constants.damage * 3 : this.constants.damage
                        enemy.stun = this.upgrades[4] && enemy.stun <= 0 ? 30 : 0
                        for (let i = 1; i < 9; i++) {
                            game.projectiles.push(new projectile('frag', enemy.x, enemy.y, undefined, undefined, i * (Math.PI / 4)))
                        }
                    }
                }
            } else if (this.type == 'basic') {
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, this.upgrades[1] && !this.upgrades[4] ? angle + Math.PI / 32 : angle, this))
                if (this.upgrades[6]) {
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle + Math.PI / 16, this))
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle + Math.PI / 8, this))
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle - Math.PI / 16, this))
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle - Math.PI / 8, this))
                } else if (this.upgrades[4]) {
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle + Math.PI / 16, this))
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle - Math.PI / 16, this))
                } else if (this.upgrades[1]) {
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle - Math.PI / 32, this))
                }
            } else if (this.type == 'flamethrower') {
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, this.upgrades[6] ? angle : undefined, this))
                if (this.upgrades[6]) {
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle + Math.PI / 16, this))
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle + Math.PI / 8, this))
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle - Math.PI / 16, this))
                    game.projectiles.push(new projectile(this.type, this.x, this.y, enemy.x, enemy.y, angle - Math.PI / 8, this))
                }
            }
            this.cooldown = this.constants.cooldown
        }
        } else {
            if (this.cooldown > 0) this.cooldown--
        }
    }
    }
    delete(game) {
        let index = game.towers.indexOf(this)
        if (index > -1) game.towers.splice(index, 1)
    }
    updateUpgrades() {
        if (this.type == 'basic') {
            if (this.upgrades[0]) {
                this.constants.cooldown = 30
            }
            if (this.upgrades[2]) {
                this.constants.damage = 5
            }
            if (this.upgrades[3]) {
                this.constants.range = 600
            }
            if (this.upgrades[5]) {
                this.constants.damage = 10
            }

        } else if (this.type == 'sniper') {
            if (this.upgrades[3]) {
                this.constants.cooldown = 60
            }
            if (this.upgrades[2]) {
                this.constants.damage = 10
            }
            if (this.upgrades[5]) {
                this.constants.damage = 20
            }
        } else if (this.type == 'flamethrower') {
            if (this.upgrades[0]) {
                this.constants.cooldown = 10
            }
            if (this.upgrades[2]) {
                this.constants.damage = 4
            }
            if (this.upgrades[3]) {
                this.constants.range = 400
            }
            if (this.upgrades[5]) {
                this.constants.damage = 10
            }
        }
    }
    sell(game) {
        let value = this.constants.cost
        for (let i in this.upgrades) {
            if (this.upgrades[i]) {
                value += upgrades[this.type][i].cost
            }
        }
        game.players[this.owner].money += Math.floor(value / 4 * 3)
        this.delete(game)
    }
}

module.exports = tower