/** This object will hold all the keys that are being pressed.
 *  @type {Object<string,true>}
 */
const keys = {};

// events to listen to keys and register them
window.addEventListener("keyup", (event) => {
  event.preventDefault();
  keys[event.key] = false;
});
window.addEventListener("keydown", (event) => {
  event.preventDefault();
  keys[event.key] = true;
});

class Spaceship {
  // Sprites for the spaceship engine fire (off)
  fireOffSprites = [
    loadSprite("img/fire1/tile000.png"),
    loadSprite("img/fire1/tile001.png"),
    loadSprite("img/fire1/tile002.png"),
    loadSprite("img/fire1/tile003.png"),
  ];
  // Sprites for the spaceship engine fire (on)
  fireOnSprites = [
    loadSprite("img/fire2/tile000.png"),
    loadSprite("img/fire2/tile001.png"),
    loadSprite("img/fire2/tile002.png"),
    loadSprite("img/fire2/tile003.png"),
    loadSprite("img/fire2/tile004.png"),
    loadSprite("img/fire2/tile005.png"),
  ];
  // Sprite for the spaceship engine
  engineSprite = loadSprite("img/engine.png");
  // Sprite for the spaceship
  spaceshipSprite = loadSprite("img/ship.png");
  // Sprites for when the spaceship crashes
  explosionSprites = [
    loadSprite("img/explosion/tile000.png"),
    loadSprite("img/explosion/tile001.png"),
    loadSprite("img/explosion/tile002.png"),
    loadSprite("img/explosion/tile003.png"),
    loadSprite("img/explosion/tile004.png"),
    loadSprite("img/explosion/tile005.png"),
    loadSprite("img/explosion/tile006.png"),
    loadSprite("img/explosion/tile007.png"),
  ];
  // The spaceship has 2 colliders. First is vertical, second is horizontal.
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
    /** controllable by player */
    this.controllable = false; 
    this.speedX = 1;
    this.speedY = 1;
    this.x = game.canva.width / 2 - 24;
    this.y = game.canva.height;
    /** when engine is on it spits fire */
    this.engineOn = false; 
    /** force engine to stay on */
    this.keepEngineOn = false; 
    /** force engine to stay on at maximum fire power (only matters animation-wise) */
    this.keepEngineOnBoost = false; 
    /** force engine to stay chill (no spitting fire) */
    this.keepEngineOff = false; 
    /**
     * autopilot can be configured so the spaceship drives itself to a position
     * @type {{on: boolean, targetX: number, targetY: number, config: AutopilotConfig}}
     */
    this.autopilot = {
      on: false,
      targetX: null,
      targetY: null,
      /** @typedef {restoreSpeed: [number,number] | null, onArrival: {Function | null}} AutopilotConfig  */
      config: {
        restoreSpeed: null,
        onArrival: null,
      },
    };
    this.crashed = false;
    this.crashedFrame = 0;
  }

  #moveLeft = () => {
    const destination = this.x - this.speedX;
    if (!this.controllable) return (this.x = destination);
    if (destination + this.colliders[1].x < 0) {
      return (this.x = -this.colliders[1].x);
    }
    return (this.x = destination);
  };
  #moveUp = () => {
    const destination = this.y - this.speedY;
    if (!this.controllable) return (this.y = destination);
    if (destination + this.colliders[0].y < 0) {
      return (this.y = -this.colliders[0].y);
    }
    return (this.y = destination);
  };
  #moveRight = () => {
    const destination = this.x + this.speedX;
    if (!this.controllable) return (this.x = destination);
    if (
      destination + this.colliders[1].x >
      this.game.width - this.colliders[1].w
    ) {
      return (this.x =
        this.game.width - this.colliders[1].w - this.colliders[1].x);
    }
    return (this.x = destination);
  };
  #moveDown = () => {
    const destination = this.y + this.speedY;
    if (!this.controllable) return (this.y = destination);
    if (
      destination + this.colliders[0].y >
      this.game.height - this.colliders[0].h
    ) {
      return (this.y =
        this.game.height - this.colliders[0].h - this.colliders[0].y);
    }
    return (this.y = destination);
  };

  resetPosition() {
    this.x = game.canva.width / 2 - 24;
    this.y = game.canva.height;
  }

  resetState() {
    this.currentFrame = 1;
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
    this.crashed = false;
    this.crashedFrame = 0;
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

    // if crashed remove player control
    if (this.crashed) this.controllable = false;
    // move the spaceship according to the keys pressed if it is controllable
    if (this.controllable) {
      if (keys["ArrowLeft"]) this.#moveLeft();
      if (keys["ArrowUp"]) {
        movedUp = true;
        this.#moveUp();
      }
      if (keys["ArrowRight"]) this.#moveRight();
      if (keys["ArrowDown"]) this.#moveDown();
    }

    // if autopilot on, move in direction to the targeted place
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
      // if already in the targeted coordinates, stop/finish autopilot
      if (
        this.x === this.autopilot.targetX &&
        this.y === this.autopilot.targetY
      )
        this.#autopilotOff();
    }

    // sprite logic
    this.engineOn = (movedUp || this.keepEngineOn) && !this.keepEngineOff;
    if (!this.engineOn) this.currentFrame = 150;

    let currentFrame = Math.floor(this.currentFrame / 50);

    let firesprite;
    if (this.engineOn) {
      firesprite = this.fireOnSprites[Math.min(currentFrame, 5)];
      if (this.game.background.speedY > 2.5 || this.keepEngineOnBoost) {
        firesprite = this.fireOnSprites[5];
      }
    }
    if (!this.engineOn) {
      firesprite =
        this.fireOffSprites[currentFrame % this.fireOffSprites.length];
    }

    // if the spaceship didn't crash, or it crashed but the explosion is not done yet, draw the spaceship,
    // engine, and fire.
    if (this.crashedFrame < 81) {
      this.game.context.drawImage(firesprite, this.x, this.y + 3, 48, 48);
      this.game.context.drawImage(
        this.engineSprite,
        this.x,
        this.y + 3,
        48,
        48
      );
      this.game.context.drawImage(this.spaceshipSprite, this.x, this.y, 48, 48);
    }

    // Draw collision lines
    // this.colliders.forEach((collider) => {
    //   const x = this.x + collider.x;
    //   const y = this.y + collider.y;

    //   this.game.context.beginPath();
    //   this.game.context.strokeStyle = "red";
    //   this.game.context.lineWidth = 2;
    //   this.game.context.strokeRect(x, y, collider.w, collider.h);
    //   this.game.context.closePath();
    // });

    // set next frame
    this.currentFrame = ((this.currentFrame + this.speedY * 5) % 250) + 1;

    if (this.crashed) this.#drawExplosion();
  }

  #drawExplosion() {
    if (this.crashedFrame < 216) {
      this.crashedFrame++;
      const frame = Math.ceil(this.crashedFrame / 27 - 1);
      this.game.context.drawImage(
        this.explosionSprites[frame],
        this.x,
        this.y,
        48,
        48
      );
    }
  }
}
