const asteroids = [];
const asteroidCollisions = [
  { x: 6, y: 9, w: -12, h: -13 },
  { x: 3, y: 9, w: -10, h: -13 },
  { x: 6, y: 7, w: -13, h: -10 },
  { x: 3, y: 9, w: -10, h: -12 },
  { x: 1, y: 7, w: -5, h: -9 },
  { x: 2, y: 4, w: -9, h: -5 },
  { x: 0, y: 3, w: -1, h: -4 },
  { x: 2, y: 4, w: -6, h: -5 },
  { x: 2, y: 3, w: -6, h: -8 },
  { x: -2, y: 1, w: -1, h: -4 },
  { x: 3, y: 1, w: -8, h: -5 },
  { x: 2, y: 2, w: -8, h: -6 },
  { x: 3, y: 1, w: -7, h: -10 },
  { x: 0, y: -1, w: -3, h: -10 },
  { x: 4, y: 0, w: -10, h: -10 },
  { x: 0, y: 0, w: -3, h: -10 },
];
for (let i = 0; i < 16; i++) {
  const spritesSelection = [4, 5, 7, 8, 10, 11, 14];
  if (!spritesSelection.includes(i)) continue;

  const sprite = loadSprite(
    "img/asteroid/tile" + String(i).padStart(3, "0") + ".png"
  );
  asteroids.push([sprite, asteroidCollisions[i]]);
}

class Obstacle {
  constructor(canvaWidth, canvaHeight, level) {
    const spawnLocation = Math.min(this.#getRandomInt(1, 4), level);
    let initialX, initialY, fifthPart, destinyX, destinyY;
    const speed = this.#getRandomInt(0, level + 1) * 0.015 + 0.35;
    this.canvaWidth = canvaWidth;
    this.canvaHeight = canvaHeight;

    const randomIndex = this.#getRandomInt(0, asteroids.length);
    this.sprite = asteroids[randomIndex][0];
    this.collider = asteroids[randomIndex][1];

    switch (spawnLocation) {
      // top
      case 1:
        initialX = this.#getRandomInt(1, canvaWidth + 1);
        fifthPart = canvaWidth * 0.2;
        destinyX = this.#getRandomInt(-fifthPart, canvaWidth + fifthPart + 1);
        this.y = -48;
        this.x = initialX;
        this.initialY = -48;
        this.initialX = initialX;
        this.speedY = speed;
        this.speedX = (destinyX - initialX) / (canvaHeight / speed);
        break;
      // left
      case 2:
        initialY = this.#getRandomInt(1, canvaHeight + 1);
        fifthPart = canvaHeight * 0.2;
        destinyY = this.#getRandomInt(-fifthPart, canvaHeight + fifthPart + 1);
        this.y = initialY;
        this.x = -48;
        this.initialY = initialY;
        this.initialX = -48;
        this.speedX = speed;
        this.speedY = (destinyY - initialY) / (canvaWidth / speed);
        break;
      // right
      case 3:
        initialY = this.#getRandomInt(1, canvaHeight + 1);
        fifthPart = canvaHeight * 0.2;
        destinyY = this.#getRandomInt(-fifthPart, canvaHeight + fifthPart + 1);
        this.y = initialY;
        this.x = canvaWidth + 48;
        this.initialY = initialY;
        this.initialX = canvaWidth + 48;
        this.speedX = -speed;
        this.speedY = (destinyY - initialY) / (canvaWidth / speed);
        break;
    }
  }

  // The maximum is exclusive and the minimum is inclusive
  #getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  checkInScreen() {
    const xOut = this.x <= -48 || this.x >= this.canvaWidth;
    const yOut = this.y <= -48 || this.y >= this.canvaHeight;
    if (
      (xOut || yOut) &&
      (this.x !== this.initialX || this.y !== this.initialY)
    ) {
      return false;
    }
    return true;
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  checkCollision(x, y, width, height) {
    const xStartCollapse = x < this.x + this.collider.x + 48 + this.collider.w;
    const xEndCollapse = x + width > this.x + this.collider.x;
    const yStartCollapse = y < this.y + this.collider.y + 48 + this.collider.h;
    const yEndCollapse = y + height > this.y + this.collider.y;

    return xStartCollapse && xEndCollapse && yStartCollapse && yEndCollapse;
  }
}
