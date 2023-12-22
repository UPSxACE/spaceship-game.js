const loadSprite = (url) => {
  const img = new Image(48, 48);
  img.src = url;
  return img;
};

/**
 * This function can be used to get values from X to Y, at an increasing (non-linear) pace.
 *
 * ej:
 *
 * f(0, 5) = 0
 *
 * f(0.2, 5) = 0.74...
 *
 * f(0.4, 5) = 1.59...
 *
 * f(0.6, 5) = 2.57...
 *
 * f(1, 5) = 5
 *
 * @param {Number} referenceValue number between 0 and 1
 * @param {Number} maxNumber number that will be returned on referenceValue = 1
 * @returns {Number}
 */
function exponentialIncreaseFunc(referenceValue, maxNumber) {
  return maxNumber * (Math.pow(2, referenceValue) - 1);
}

/**
 * Same as exponentialIncreaseFunc, but the first values scale more slowly
 * and the latter ones faster. It's possible to control that difference
 * with the third argument
 *
 * @param {Number} referenceValue number between 0 and 1
 * @param {Number} maxNumber number that will be returned on referenceValue = 1
 * @param {Number} smoothness smoothen the early values
 * @returns {Number}
 */
function exponentialIncreaseSmootherFunc(
  referenceValue,
  maxNumber,
  smoothness
) {
  const smoothRefValue =
    referenceValue * referenceValue * (3 - 2 * referenceValue);
  return maxNumber * (1 - Math.pow(1 - smoothRefValue, smoothness));
}

// Background MUST be 400x400
class Background {
  /**
   *
   * @param {CanvasRenderingContext2D} context
   * @param {String} imgSource
   * @param {Number} width
   * @param {Number} height
   */
  constructor(context, imgSource, width, height) {
    this.context = context;
    this.image = new Image(width, height);
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
    this.speedX = 0;
    this.speedY = 0.1;
    this.speedIncreaseStep = 1;
    this.speedIncreaseStepPace = 0.0025;
    this.targetSpeedX = [0.1, 0.1]; // initial, final
    this.targetSpeedY = [0.1, 0.1]; // initial, final

    this.image.onload = () => (this.ready = true);
    this.image.src = imgSource;

    this.afterSpeedChangeCallback = null;
  }

  changeSpeedY(newSpeed, pace, afterSpeedChangeCallback) {
    this.speedIncreaseStepPace = pace;
    this.targetSpeedY = [this.speedY, newSpeed];
    this.speedIncreaseStep = 0;
    this.afterSpeedChangeCallback = afterSpeedChangeCallback
      ? afterSpeedChangeCallback
      : null;
  }

  draw() {
    if (this.ready) {
      if (this.y < this.height) {
        this.y += this.speedY;
      }
      if (this.y >= this.height) {
        this.y = (this.y % this.height) + 1 + this.speedY;
      }

      this.context.drawImage(this.image, this.x, this.y - this.height + 2);
      this.context.drawImage(this.image, this.x, this.y);
      this.context.drawImage(this.image, this.x, this.y + this.height - 2);

      // Set new speed step
      if (this.speedIncreaseStep + this.speedIncreaseStepPace > 1) {
        this.speedIncreaseStep = 1;
      }
      if (this.speedIncreaseStep !== 1) {
        this.speedIncreaseStep += this.speedIncreaseStepPace;
      }

      // Set new speed
      const difSpeedInitialFinal = Math.abs(
        this.targetSpeedY[1] - this.targetSpeedY[0]
      );

      if (this.targetSpeedY[1] > this.speedY) {
        // increase speed
        this.speedY =
          this.targetSpeedY[0] +
          exponentialIncreaseSmootherFunc(
            this.speedIncreaseStep,
            difSpeedInitialFinal,
            1.25
          );
      }
      if (this.targetSpeedY[1] < this.speedY) {
        // decrease speed
        this.speedY =
          this.targetSpeedY[0] -
          exponentialIncreaseSmootherFunc(
            this.speedIncreaseStep,
            difSpeedInitialFinal,
            1.25
          );
      }

      // Reset target speed
      if (this.speedIncreaseStep === 1) {
        this.targetSpeedY = [this.targetSpeedY[1], this.targetSpeedY[1]];
        this.speedIncreaseStepPace = 0.0025;
        if (this.afterSpeedChangeCallback) {
          this.afterSpeedChangeCallback();
          this.afterSpeedChangeCallback = null;
        }
      }
    }
  }
}

class Game {
  /**
   * @param {HTMLCanvasElement} canvaNode
   */
  constructor(canvaNode) {
    this.canva = canvaNode;
    /** @type {Number} */
    this.width = this.canva.width;
    /** @type {Number} */
    this.height = this.canva.height;
    /** @type {CanvasRenderingContext2D} */
    this.context = this.canva.getContext("2d");
    this.background = new Background(this.context, "img/bg.png", 400, 400);
    this.spaceship = new Spaceship(this);
    // this.spaceship
    // this.bullets
    // this.obstacles
  }
}

const keys = {};

window.addEventListener("keyup", (event) => {
  event.preventDefault();
  keys[event.key] = false;
});
window.addEventListener("keydown", (event) => {
  event.preventDefault();
  keys[event.key] = true;
});

class Spaceship {
  fireOffSprites = [
    loadSprite("img/fire1/tile000.png"),
    loadSprite("img/fire1/tile001.png"),
    loadSprite("img/fire1/tile002.png"),
    loadSprite("img/fire1/tile003.png"),
  ];
  fireOnSprites = [
    loadSprite("img/fire2/tile000.png"),
    loadSprite("img/fire2/tile001.png"),
    loadSprite("img/fire2/tile002.png"),
    loadSprite("img/fire2/tile003.png"),
    loadSprite("img/fire2/tile004.png"),
    loadSprite("img/fire2/tile005.png"),
  ];
  engineSprite = loadSprite("img/engine.png");
  spaceshipSprite = loadSprite("img/ship.png");
  colliders = [
    {
      x: 19,
      y: 9,
      w: 10,
      h: 30,
    },
    {
      x: 8,
      y: 29,
      w: 32,
      h: 10,
    },
  ];

  /**
   * @param {Game} game
   */
  constructor(game) {
    this.currentFrame = 1; // from 1 to 150
    this.game = game;
    this.controllable = false;
    this.speedX = 1;
    this.speedY = 1;
    this.x = game.canva.width / 2 - 24;
    this.y = game.canva.height;
    this.engineOn = false;
    this.keepEngineOn = false;
    this.keepEngineOnBoost = false;
    this.keepEngineOff = false;
    this.autopilot = {
      on: false,
      targetX: null,
      targetY: null,
      config: {
        restoreSpeed: null,
        onArrival: null,
      },
    };
  }

  #moveLeft = () => (this.x -= this.speedX);
  #moveUp = () => (this.y -= this.speedY);
  #moveRight = () => (this.x += this.speedX);
  #moveDown = () => (this.y += this.speedY);

  resetPosition() {
    this.x = game.canva.width / 2 - 24;
    this.y = game.canva.height;
  }

  #autopilotOff() {
    if (this.autopilot?.config?.restoreSpeed) {
      this.speedX = this.autopilot.config.restoreSpeed[0];
      this.speedY = this.autopilot.config.restoreSpeed[1];
    }

    let onArrival = () => {};

    if (this.autopilot?.config?.onArrival) {
      onArrival = this.autopilot.config.onArrival;
    }

    this.autopilot = {
      on: false,
      targetX: null,
      targetY: null,
      config: {
        restoreSpeed: null,
        onArrival: null,
      },
    };

    onArrival();
  }

  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {{speed?: [Number, Number], relativeSpeed?: [Number, Number], onArrival?: Function}?} config
   */
  goTo(x, y, config) {
    const autopilot = {
      on: true,
      targetX: x,
      targetY: y,
      config: {
        restoreSpeed: null,
        onArrival: null,
      },
    };

    if (config?.onArrival) autopilot.config.onArrival = config.onArrival;

    const originalSpeed = [this.speedX, this.speedY];

    if (config?.speed) {
      autopilot.config.restoreSpeed = originalSpeed;
      this.speedX = config.speed[0];
      this.speedY = config.speed[1];
    }

    if (config?.relativeSpeed) {
      autopilot.config.restoreSpeed = originalSpeed;
      this.speedX = this.speedX * config.relativeSpeed[0];
      this.speedY = this.speedY * config.relativeSpeed[1];
    }

    this.autopilot = autopilot;
  }

  draw() {
    let movedUp = false;

    if (this.controllable) {
      if (keys["ArrowLeft"]) this.#moveLeft();
      if (keys["ArrowUp"]) {
        movedUp = true;
        this.#moveUp();
      }
      if (keys["ArrowRight"]) this.#moveRight();
      if (keys["ArrowDown"]) this.#moveDown();
    }

    if (this.autopilot.on) {
      if (this.speedX > Math.abs(this.x - this.autopilot.targetX))
        this.x = this.autopilot.targetX;
      if (this.speedY > Math.abs(this.y - this.autopilot.targetY))
        this.y = this.autopilot.targetY;
      if (this.x < this.autopilot.targetX) this.#moveRight();
      if (this.x > this.autopilot.targetX) this.#moveLeft();
      if (this.y < this.autopilot.targetY) this.#moveDown();
      if (this.y > this.autopilot.targetY) {
        movedUp = true;
        this.#moveUp();
      }
      if (
        this.x === this.autopilot.targetX &&
        this.y === this.autopilot.targetY
      )
        this.#autopilotOff();
    }

    this.engineOn = (movedUp || this.keepEngineOn) && !this.keepEngineOff;
    if (!this.engineOn) this.currentFrame = 150;

    // let currentFrame = Math.floor(this.currentFrame / 25);
    let currentFrame = Math.floor(this.currentFrame / 50);

    let firesprite;
    if (this.engineOn) {
      // firesprite = this.fireOnSprites[currentFrame % this.fireOnSprites.length];
      firesprite = this.fireOnSprites[Math.min(currentFrame, 5)];
      if (this.game.background.speedY > 2.5 || this.keepEngineOnBoost) {
        firesprite = this.fireOnSprites[5];
      }
    }
    if (!this.engineOn) {
      firesprite =
        this.fireOffSprites[currentFrame % this.fireOffSprites.length];
    }

    this.game.context.drawImage(firesprite, this.x, this.y + 3, 48, 48);
    this.game.context.drawImage(this.engineSprite, this.x, this.y + 3, 48, 48);
    this.game.context.drawImage(this.spaceshipSprite, this.x, this.y, 48, 48);

    this.colliders.forEach((collider) => {
      const x = this.x + collider.x;
      const y = this.y + collider.y;

      this.game.context.beginPath();
      this.game.context.strokeStyle = "red";
      this.game.context.lineWidth = 2;
      this.game.context.strokeRect(x, y, collider.w, collider.h);
      this.game.context.closePath();
    });

    this.currentFrame = ((this.currentFrame + this.speedY * 5) % 250) + 1;
  }
}

const asteroids = [];
const collisions = [
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
  const sprite = loadSprite(
    "img/asteroid/tile" + String(i).padStart(3, "0") + ".png"
  );
  asteroids.push([sprite, collisions[i]]);
}

class Obstacle {
  constructor(canvaWidth, canvaHeight, level, sprite) {
    const spawnLocation = Math.min(this.#getRandomInt(1, 4), level);
    let initialX, initialY, fifthPart, destinyX, destinyY;
    const speed = this.#getRandomInt(0, level + 1) * 0.015 + 0.35;
    this.canvaWidth = canvaWidth;
    this.canvaHeight = canvaHeight;
    this.sprite = asteroids[sprite][0];
    this.collision = asteroids[sprite][1];

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
    const xStartCollapse =
      x < this.x + this.collision.x + 48 + this.collision.w;
    const xEndCollapse = x + width > this.x + this.collision.x;
    const yStartCollapse =
      y < this.y + this.collision.y + 48 + this.collision.h;
    const yEndCollapse = y + height > this.y + this.collision.y;

    return xStartCollapse && xEndCollapse && yStartCollapse && yEndCollapse;
  }
}

class Screen {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.obstacles = [];
  }
  #drawObstacle(obstacle) {
    this.game.context.drawImage(
      obstacle.sprite,
      obstacle.x,
      obstacle.y,
      48,
      48
    );

    let collided = false;

    this.game.spaceship.colliders.forEach((collider) => {
      const x = this.game.spaceship.x + collider.x;
      const y = this.game.spaceship.y + collider.y;
      if (obstacle.checkCollision(x, y, collider.w, collider.h)) {
        collided = true;
      }
    });

    this.game.context.beginPath();
    this.game.context.strokeStyle = collided ? "red" : "green";
    this.game.context.lineWidth = 2;
    this.game.context.strokeRect(
      obstacle.x + obstacle.collision.x,
      obstacle.y + obstacle.collision.y,
      48 + obstacle.collision.w,
      48 + obstacle.collision.h
    );
    this.game.context.closePath();
  }

  #clear() {
    this.game.context.clearRect(0, 0, this.game.width, this.game.height);
  }

  #update() {
    this.game.background.draw();
    this.game.spaceship.draw();
    this.obstacles.forEach((obstacle) => {
      this.#drawObstacle(obstacle);
    });
  }

  load() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const obstacle = new Obstacle(
          this.game.width,
          this.game.height,
          this.level,
          i * 4 + j
        );

        obstacle.x = j * 48 + 60 * j;
        obstacle.y = i * 48 + 60 * i;

        this.obstacles.push(obstacle);
      }
    }

    this.game.spaceship.controllable = true;
    this.interval = setInterval(() => {
      this.#clear();
      this.#update();
    }, 1000 / 144); // 144 frames per second
  }
}

const canva = document.getElementById("game");
const game = new Game(canva);
const screen = new Screen(game);
screen.load();
