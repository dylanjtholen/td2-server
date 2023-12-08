class enemy {
    constructor(health, type) {
        this.health = health;
        this.type = type;
        this.speed = 10
        this.stun = 0
        this.burning = 0
        this.intenseburning = 0
        this.burningdamage = 0
        this.x = waypoints[0].x
        this.y = waypoints[0].y
        this.distanceTravelled = 0
        this.waypointIndex = 1
    }
    update(game) {
        let angle = Math.atan2(waypoints[this.waypointIndex].y - this.y, waypoints[this.waypointIndex].x - this.x)
        if (this.stun <= 0) {
        this.x += Math.cos(angle) * this.speed / (this.intenseburning > 0 ? 2 : 1)
        this.y += Math.sin(angle) * this.speed / (this.intenseburning > 0 ? 2 : 1)
        this.distanceTravelled += this.speed / (this.intenseburning > 0 ? 2 : 1)
        } else {
        this.stun--
        }
        this.image.x = this.x
        this.image.y = this.y
        this.image.text = this.health
        if (Math.abs(this.x - waypoints[this.waypointIndex].x) < this.speed && Math.abs(this.y - waypoints[this.waypointIndex].y) < this.speed) {
            this.waypointIndex++
            if (this.waypointIndex >= waypoints.length) {
                this.delete(game)
                game.health -= this.health
            }
        }
        if (this.burning >= 0) {
            if (this.burning % 30 == 0) this.health -= this.burningdamage
            this.burning--
            this.intenseburning--
            this.image.color = 'orange'
        } else {
            this.image.color = 'red'
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