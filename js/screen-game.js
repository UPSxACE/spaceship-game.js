class ScreenGame {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.state = "LOADING";
    this.level = 0;
    this.animations = {
      levelTextOpacity: 0,
      levelTextBlinkingState: 1, // 0, 1, 2 or 3
      scoreOpacity: 0,
    };
    this.waitLevelText = 0;
    this.score = 0;
    this.timePoints = 0;
    /**
     * @type {Obstacle[]}
     */
    this.obstacles = [];
  }

  // The maximum is exclusive and the minimum is inclusive
  #getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  #drawLevelText() {
    let opacity = this.animations.levelTextOpacity;

    if (this.animations.levelTextBlinkingState === 1) {
      opacity = this.animations.levelTextOpacity + 0.005;
      if (opacity >= 1) {
        opacity = 1;
        this.animations.levelTextBlinkingState = 2;
      }
    }

    if (this.animations.levelTextBlinkingState === 3) {
      opacity = this.animations.levelTextOpacity - 0.01;
      if (opacity <= 0) {
        opacity = 0;
        this.animations.levelTextBlinkingState = 3;
      }
    }

    this.animations.levelTextOpacity = opacity;

    this.game.context.beginPath();
    this.game.context.font = "24px 'Press Start 2P'"; // starts at 16 ends at 32
    this.game.context.fillStyle = `rgba(255, 255, 255, ${opacity})`;

    const text = `Level ${this.level}`;
    const measurement = this.game.context.measureText(text); // TextMetrics object
    const tWidth = measurement.width;

    const x = this.game.width / 2 - tWidth / 2;
    const y = 80;
    this.game.context.fillText(text, x, y, 360);
    this.game.context.closePath();
  }

  #drawScore() {
    let opacity = this.animations.scoreOpacity;

    if (
      this.state === "NEW_LEVEL" &&
      this.animations.levelTextBlinkingState === 1
    ) {
      opacity = this.animations.scoreOpacity - 0.005;
      if (opacity <= 0) {
        opacity = 0;
      }
    }

    if (
      this.state === "NEW_LEVEL" &&
      this.animations.levelTextBlinkingState === 3
    ) {
      opacity = this.animations.scoreOpacity + 0.005;
      if (opacity >= 1) {
        opacity = 1;
      }
    }

    if (this.state === "PLAYING" && opacity < 1) {
      opacity = this.animations.scoreOpacity + 0.005;
      if (opacity >= 1) {
        opacity = 1;
      }
    }

    this.animations.scoreOpacity = opacity;
    this.game.context.beginPath();
    this.game.context.font = "12px 'Press Start 2P'"; // starts at 16 ends at 32
    this.game.context.fillStyle = `rgba(255, 255, 255, ${opacity})`;

    const text = `Score: ${this.score}`;
    const measurement = this.game.context.measureText(text); // TextMetrics object
    const tWidth = measurement.width;

    const x = this.game.width - tWidth - 12;
    const y = 24;
    this.game.context.fillText(text, x, y, 360);
    this.game.context.closePath();
  }

  /**
   * @param {Obstacle} obstacle
   */
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
      obstacle.x + obstacle.collider.x,
      obstacle.y + obstacle.collider.y,
      48 + obstacle.collider.w,
      48 + obstacle.collider.h
    );
    this.game.context.closePath();
  }

  #clear() {
    this.game.context.clearRect(0, 0, this.game.width, this.game.height);
  }

  #update() {
    this.game.background.draw();
    this.game.spaceship.draw();
    if (this.state === "NEW_LEVEL") {
      if (this.animations.levelTextBlinkingState === 2) {
        this.waitLevelText >= 0
          ? this.waitLevelText--
          : (this.animations.levelTextBlinkingState = 3);
      }

      this.#drawLevelText();

      if (
        this.animations.levelTextBlinkingState === 3 &&
        this.animations.levelTextOpacity === 0
      ) {
        this.waitLevelText = 2 * 144;
        this.state = "PLAYING";
        this.animations.levelTextBlinkingState = 1;
      }
    }

    if (
      this.state === "PLAYING" &&
      this.nextLevelTimer === 0 &&
      this.obstacles.length === 0
    ) {
      if (this.level === 9) {
        this.game.spaceship.keepEngineOn = true;
      }
      if (this.level === 14) {
        this.game.spaceship.keepEngineOnBoost = true;
      }
      this.level++;
      this.state = "NEW_LEVEL";
      if (this.level % 5 === 0)
        this.game.background.changeSpeedY(
          0.2 + this.level * 0.1,
          1 / (1.5 * 144)
        );
      this.nextLevelTimer = Math.floor((3.75 + this.level * 1.25) * 144);
    }

    if (this.state === "PLAYING" && this.nextLevelTimer > 0) {
      this.nextLevelTimer--;
    }

    if (this.state === "PLAYING") {
      this.timePoints++;
      if (this.timePoints > 144 * 10) {
        this.timePoints = 0;
        this.score += this.level;
      }
    }

    if (this.state === "NEW_LEVEL" || this.state === "PLAYING") {
      this.#drawScore();
    }

    if (
      (this.state === "PLAYING" && this.nextLevelTimer % 288 === 1) ||
      (this.state === "PLAYING" && this.obstacles.length === 0)
    ) {
      let rng =
        this.#getRandomInt(this.level * 10, (this.level * 0.01 + 1) * 10) / 10;
      for (rng; rng > 0; rng--) {
        const obstacle = new Obstacle(
          this.game.width,
          this.game.height,
          this.level
        );
        this.obstacles.push(obstacle);
      }
    }

    if (this.state === "PLAYING") {
      this.obstacles = this.obstacles.filter((obstacle) => {
        obstacle.move();

        const inScreen = obstacle.checkInScreen();

        if (inScreen) {
          this.#drawObstacle(obstacle);
          return true;
        }

        this.score++;
        return false;
      });
    }
  }

  load() {
    this.game.spaceship.keepEngineOn = false;
    this.game.spaceship.keepEngineOnBoost = false;
    this.game.spaceship.keepEngineOff = false;
    this.game.spaceship.speedX = 1;
    this.game.spaceship.speedY = 1;

    const x = this.game.width / 2 - 24;
    const y = this.game.height - 60;
    this.game.background.changeSpeedY(0.2, 0.002);
    this.game.spaceship.goTo(x, y, {
      onArrival: () => {
        this.obstacles = [];
        this.game.spaceship.controllable = true;
        this.level = 1;
        this.score = 0;
        this.timePoints = 0;
        this.waitLevelText = 2 * 144; // This gives 2 seconds for the user to look at the new Level text
        this.nextLevelTimer = 5 * 144; // First level takes 5 seconds
        this.state = "NEW_LEVEL";
      },
      speed: [0.8, 0.8],
    });

    this.interval = setInterval(() => {
      this.#clear();
      this.#update();
    }, 1000 / 144); // 144 frames per second
  }
}
