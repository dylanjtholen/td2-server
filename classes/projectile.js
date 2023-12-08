const { rectcirclecollision, towerConstants } = require('../utils.js')

class projectile {
    constructor(type, x, y, targetx, targety, angle, parent) {
        this.type = type
        this.constants = parent.type != 'sniper' ? parent.constants : {range: 600, damage: 5, speed: 45}
        this.x = x
        this.y = y
        this.health = this.constants.damage
        this.targetx = targetx
        this.targety = targety
        this.speed = this.constants.speed
        this.width = 100
        this.height = 100
        this.angle = angle || Math.atan2(this.targety - this.y, this.targetx - this.x)
        this.distanceTravelled = 0
        this.upgrades = parent.upgrades || []
        if (parent.type == 'sniper' && this.type == 'frag') {
            this.enemyexclude = parent.enemyexclude
        }
    }
    update(game) {
        this.x += Math.cos(this.angle) * this.speed
        this.y += Math.sin(this.angle) * this.speed
        this.distanceTravelled += this.speed
        if (this.distanceTravelled >= this.constants.range) {
            this.delete(game)
        }
        for (let i in game.enemies) {
        let enemy = game.enemies[i]
        if (rectcirclecollision({x: this.x, y: this.y, w: this.width, h: this.height}, {x: enemy.x - 25, y: enemy.y - 25, r: 50}) && this.enemyexclude != enemy) {
            game.players[owner].money += enemy.health <= this.constants.damage ? enemy.health : this.constants.damage
            let temphealth = this.health
            this.health -= enemy.health
            enemy.health -= temphealth
            if (this.type == 'flamethrower' && enemy.burning < 0 && (this.upgrades[1] || this.upgrades[4])) {
            enemy.burning = this.upgrades[4] ? 120 : this.upgrades[1] ? 60 : 0
            enemy.intenseburning = this.upgrades[4] ? 120 : 0
            enemy.burningdamage = this.constants.damage
            }
            if (enemy.health <= 0) enemy.delete(game)
            if (this.health <= 0) this.delete(game)
            break
        }
    }
    }
    delete(game) {
        let index = game.projectiles.indexOf(this)
        if (index > -1) game.projectiles.splice(index, 1)
    }
}

module.exports = projectile