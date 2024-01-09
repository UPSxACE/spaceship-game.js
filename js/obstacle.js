/**
 * @typedef {x: number, y: number, w: number, h: number} AsteroidCollider
 */

/**
 * This variable holds the loaded asteroid sprites. Asteroids can look different from each other,
 * so there needs to be loaded multiple sprites.
 * @type {[HTMLImageElement, AsteroidCollider][]}
 */
const asteroids = [];
/**
 * This variable holds the coordinates, width and height of the asteroid's colliders.
 * @type {AsteroidCollider[]}
 */
const asteroidColliders = [
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
// Load asteroid sprites, and their colliders
for (let i = 0; i < 16; i++) {
  // There is a total of 15 asteroid sprites, but some of them would require more complex colliders.
  // To make it easier for this small experimental project, I am filtering the sprites, and only
  // taking the ones for which having only 1 collider is enough.
  const spritesSelection = [4, 5, 7, 8, 10, 11, 14];
  if (!spritesSelection.includes(i)) continue;

  // Load
  const sprite = loadSprite(
    "img/asteroid/tile" + String(i).padStart(3, "0") + ".png"
  );

  // Push the selected and loaded sprite to the asteroids array.
  asteroids.push([sprite, asteroidColliders[i]]);
}

class Obstacle {
  constructor(canvaWidth, canvaHeight, level) {
    // Asteroids are generated in a random side of the screen (up, left or right).
    // If generated on the left, they will spawn in a random point of the Y axis and travel
    // to a random point in the right side of the screen.
    // If generated on the right, its the exact opposite.
    // If generated on top of the screen, it will travel to a random point of the X axis,
    // on the bottom of the screen.
    // On the first level they always spawn on the top part of the screen.
    // in the second level they start appearing on the left, and in the third level they start
    // appearing on the right.
    const spawnLocation = Math.min(this.#getRandomInt(1, 4), level);
    let initialX, initialY, fifthPart, destinyX, destinyY;
    // Their speed is also slightly random and different from each other.
    const speed = this.#getRandomInt(0, level + 1) * 0.015 + 0.35;
    this.canvaWidth = canvaWidth;
    this.canvaHeight = canvaHeight;

    // Pick random sprite-collider pair for the asteroid.
    const randomIndex = this.#getRandomInt(0, asteroids.length);
    this.sprite = asteroids[randomIndex][0];
    this.collider = asteroids[randomIndex][1];

    // Note for the spawn location: they never spawn too close to the corners.
    // That is what the variable "fifthPart" is used for(to help restrict that possibility).
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

  /**
   * Get random integer. The maximum is exclusive and the minimum is inclusive
   * @param {number} min
   * @param {number} max
   * @returns
   */
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
