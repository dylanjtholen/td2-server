const towerConstants = {
    basic: {
        size: 105,
        cost: 150,
        cooldown: 60,
        damage: 2,
        range: 400,
        speed: 50
    },
    sniper: {
        size: 105,
        cost: 300,
        cooldown: 120,
        damage: 4,
        range: 10000
    },
    flamethrower: {
        size: 105,
        cost: 500,
        cooldown: 20,
        damage: 1,
        range: 200,
        speed: 25
    }
}

const maps = {
    easy: {
        waypoints: [{x:-10,y:185},{x:280,y:185},{x:280,y:800},{x:950,y:825},{x:940,y:190},{x:590,y:198},{x:580,y:537},{x:1561,y:535},{x:1557,y:161},{x:1267,y:152},{x:1291,y:858},{x:1760,y:870}],
        obstacles: [{x: 0, y: 115, w: 360, h: 135}, {x: 215, y: 115, w: 130, h: 755}, {x: 210, y: 740, w: 805, h: 145}, {x: 888, y: 120, w: 135, h: 768}, {x: 522, y: 119, w: 506, h: 139}, {x: 510, y: 123, w: 132, h: 485}, {x: 505, y: 472, w: 1114, h: 132}, {x: 1495, y: 94, w: 124, h: 506}, {x: 1211, y: 94, w: 414, h: 128}, {x: 1211, y: 94, w: 141, h: 834}, {x: 1209, y: 789, w: 507, h: 137}, {x: 1005, y: 104, w: 195, h: 178}, {x: 1014, y: 786, w: 195, h: 205}]
        
    },
    medium: {
        waypoints: [{x:300,y:-13},{x:313,y:821},{x:804,y:820},{x:817,y:254},{x:1407,y:259},{x:1421,y:821},{x:1760,y:824}],
        obstacles: [{x:239,y:0,w:141,h:887},{x:239,y:747,w:625,h:134},{x:749,y:186,w:114,h:691},{x:749,y:185,w:730,h:121},{x:1350,y:185,w:130,h:700},{x:1348,y:739,w:370,h:149}]
    },
    hard: {
    }
}

const upgrades = {
    basic: [
        {name: 'Faster shooting', cost: 500, description: 'shoots twice as fast'}, {name: 'Double shot', cost: 1500, description: 'shoots 2 at a time'}, {name: '+3 damage', cost: 1000, description: 'adds 3 damage, for a total of 5'},
        {name: 'Longer range', cost: 2000, description: 'doubles range'}, {name: 'Triple shot', cost: 2500, description: 'shoots 3 at a time'}, {name: '+5 damage', cost: 2000, description: 'adds 5 damage, for a total of 10'},
        {name: 'Shotgun', cost: 6000, description: 'shoots 5 at a time'}
    ],
    sniper: [
        {name: 'Critical hit', cost: 600, description: 'has a 20% chance to triple damage'}, {name: 'Frag bullets', cost: 2000, description: 'bullets explode into fragments'}, {name: '+6 damage', cost: 1500, description: '+6 damage, for a total of 10'},
        {name: 'Faster shooting', cost: 2000, description: 'shoots twice as fast'}, {name: 'Stun', cost: 3500, description: 'stuns enemies for a short time'}, {name: '+10 damage', cost: 2500, description: '+10 damage, for a total of 20'},
        {name: 'Ricochet', cost: 8000, description: 'bullets bounce from enemy to enemy'}
    ],
    flamethrower: [
        {name: 'Faster shooting', cost: 1500, description: 'shoots twice as fast'}, {name: 'Burning', cost: 3000, description: 'enemies take burning damage'}, {name: '+3 damage', cost: 2000, description: 'adds 3 damage, for a total of 4'},
        {name: 'Longer range', cost: 4000, description: 'triples range'}, {name: 'Intense burning', cost: 6000, description: 'enemies on fire move slower'}, {name: '+6 damage', cost: 3000, description: '+6 damage, for a total of 10'},
        {name: 'Inferno', cost: 10000, description: 'shoots a wide cone of flames'}
    ]
}

function rectrectcollision(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y) {
        return true
    } else {
        return false
    }
}

function checkPlacement(x, y, size, game) {
    for (let i in game.towers) {
        let tower = game.towers[i]
        if (rectrectcollision({x: x, y: y, w: size, h: size}, {x: tower.x, y: tower.y, w: tower.width, h: tower.height})) return false
    }
    for (let i in maps[game.map].obstacles) {
        let obstacle = maps[game.map].obstacles[i]
        if (rectrectcollision({x: x, y: y, w: size, h: size}, {x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h})) return false
    }
    if (x + size > 1720 || x < 0 || y + size > 1080 || y < 0) return false
    return true
}

function rectcirclecollision(rect, circle) {
    var distX = Math.abs(circle.x - rect.x-rect.w/2);
var distY = Math.abs(circle.y - rect.y-rect.h/2);

if (distX > (rect.w/2 + circle.r)) { return false; }
if (distY > (rect.h/2 + circle.r)) { return false; }

if (distX <= (rect.w/2)) { return true; } 
if (distY <= (rect.h/2)) { return true; }

var dx=distX-rect.w/2;
var dy=distY-rect.h/2;
return (dx*dx+dy*dy<=(circle.r*circle.r));

}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

module.exports = {
    towerConstants,
    distance,
    rectcirclecollision,
    checkPlacement,
    upgrades,
    maps
}