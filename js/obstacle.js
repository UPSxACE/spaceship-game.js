const asteroidSprites = [];
for (let i = 0; i < 16; i++) {
  const sprite = loadSprite(
    "img/asteroid/tile" + String(i).padStart(3, "0") + ".png"
  );
  asteroidSprites.push(sprite);
}

class Obstacle {
  constructor(canvaWidth, canvaHeight, level) {
    const spawnLocation = Math.min(this.#getRandomInt(1, 4), level);
    let initialX, initialY, fifthPart, destinyX, destinyY;
    const speed = this.#getRandomInt(0, level + 1) * 0.015 + 0.35;
    this.canvaWidth = canvaWidth;
    this.canvaHeight = canvaHeight;
    this.sprite = asteroidSprites[this.#getRandomInt(0, 16)];

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
}
