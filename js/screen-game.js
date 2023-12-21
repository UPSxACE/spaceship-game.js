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
        this.state = "PLAYING";
        this.animations.levelTextBlinkingState = 1;
      }
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
  }

  load() {
    this.game.spaceship.keepEngineOn = false;
    this.game.spaceship.keepEngineOff = false;
    this.game.spaceship.speedX = 1;
    this.game.spaceship.speedY = 1;

    const x = this.game.width / 2 - 24;
    const y = this.game.height - 60;
    this.game.background.changeSpeedY(0.85, 0.002);
    this.game.spaceship.goTo(x, y, {
      onArrival: () => {
        this.game.spaceship.controllable = true;
        this.level = 1;
        this.score = 0;
        this.timePoints = 0;
        this.waitLevelText = 2 * 144; // This gives 2 seconds for the user to look at the new Level text
        this.state = "NEW_LEVEL";
      },
      speed: [1, 1],
    });

    this.interval = setInterval(() => {
      this.#clear();
      this.#update();
    }, 1000 / 144); // 144 frames per second
  }
}
