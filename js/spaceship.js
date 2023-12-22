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
