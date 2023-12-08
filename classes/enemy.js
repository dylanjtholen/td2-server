const { maps } = require('../utils.js')

class enemy {
    constructor(health, type, game) {
        this.health = health;
        this.type = type;
        this.speed = 10
        this.stun = 0
        this.burning = 0
        this.intenseburning = 0
        this.burningdamage = 0
        this.waypoints = maps[game.map].waypoints
        this.x = this.waypoints[0].x
        this.y = this.waypoints[0].y
        this.distanceTravelled = 0
        this.waypointIndex = 1
    }
    update(game) {
        let angle = Math.atan2(this.waypoints[this.waypointIndex].y - this.y, this.waypoints[this.waypointIndex].x - this.x)
        if (this.stun <= 0) {
        this.x += Math.cos(angle) * this.speed / (this.intenseburning > 0 ? 2 : 1)
        this.y += Math.sin(angle) * this.speed / (this.intenseburning > 0 ? 2 : 1)
        this.distanceTravelled += this.speed / (this.intenseburning > 0 ? 2 : 1)
        } else {
        this.stun--
        }
        if (Math.abs(this.x - this.waypoints[this.waypointIndex].x) < this.speed && Math.abs(this.y - this.waypoints[this.waypointIndex].y) < this.speed) {
            this.waypointIndex++
            if (this.waypointIndex >= this.waypoints.length) {
                this.delete(game)
                game.health -= this.health
            }
        }
        if (this.burning >= 0) {
            if (this.burning % 30 == 0) this.health -= this.burningdamage
            this.burning--
            this.intenseburning--
        }
        if (this.health <= 0) {
            this.delete(game)
        }
    }
    delete(game) {
        let index = game.enemies.indexOf(this)
        if (index > -1) game.enemies.splice(index, 1)
    }
}

module.exports = enemy