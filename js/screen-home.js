class ScreenHome {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.state = null;
    this.animations = {
      titleOpacity: 0,
      pressStartOpacity: 0,
      pressStartBlinkingState: 1, // 1 or 2
    };
  }

  #drawTitle() {
    if (this.state === "DONELOADING") {
      let opacity =
        this.animations.titleOpacity >= 1
          ? 1
          : this.animations.titleOpacity + 0.003;
      this.animations.titleOpacity = opacity;

      this.game.context.beginPath();
      this.game.context.font = "20px 'Press Start 2P'"; // starts at 16 ends at 32
      this.game.context.fillStyle = `rgba(255, 255, 255, ${opacity})`;

      const text = "Spaceship Game";
      const measurement = this.game.context.measureText(text); // TextMetrics object
      const tWidth = measurement.width;

      const x = this.game.width / 2 - tWidth / 2;
      const y = this.game.height / 2 + 10 - 5;
      this.game.context.fillText(text, x, y, 360);
      this.game.context.closePath();
    }
  }

  #drawPressStart() {
    if (this.state === "DONELOADING") {
      let opacity = this.animations.pressStartOpacity;

      if (this.animations.pressStartBlinkingState === 1) {
        this.animations.pressStartOpacity >= 1
          ? (this.animations.pressStartBlinkingState = 3)
          : (opacity = this.animations.pressStartOpacity + 0.003);
      } else if (this.animations.pressStartBlinkingState === 2) {
        this.animations.pressStartOpacity >= 1
          ? (this.animations.pressStartBlinkingState = 3)
          : (opacity = this.animations.pressStartOpacity + 0.009);
      } else {
        this.animations.pressStartOpacity <= 0
          ? (this.animations.pressStartBlinkingState = 2)
          : (opacity = this.animations.pressStartOpacity - 0.009);
      }
      this.animations.pressStartOpacity = opacity;

      this.game.context.beginPath();
      this.game.context.font = "12px 'Press Start 2P'"; // starts at 16 ends at 32
      this.game.context.fillStyle = `rgba(255, 255, 255, ${opacity})`;

      const text = "Press Start";
      const measurement = this.game.context.measureText(text); // TextMetrics object
      const tWidth = measurement.width;

      const x = this.game.width / 2 - tWidth / 2;
      const y = this.game.height / 2 + 10 + 20 - 5;
      this.game.context.fillText(text, x, y, 360);
      this.game.context.closePath();
    }
  }

  #clear() {
    this.game.context.clearRect(0, 0, this.game.width, this.game.height);
  }

  #update() {
    this.game.background.draw();
    this.game.spaceship.draw();
    if (this.state !== null) {
      this.#drawTitle();
      this.#drawPressStart();
    }
  }

  load() {
    this.game.spaceship.resetPosition();
    // Give some time for the page to load before starting to load the game
    // Gradually increase background speed
    setTimeout(() => {
      this.game.background.changeSpeedY(2, 0.005);
    }, 500);
    setTimeout(() => {
      this.game.background.changeSpeedY(3, 0.005);
    }, 1500);
    setTimeout(() => {
      this.game.background.changeSpeedY(7, 0.0025);
    }, 3000);
    // Spawn spaceship
    setTimeout(() => {
      const gameTitleX = this.game.width / 2 - 48 / 2;
      const gameTitleY = this.game.height / 2 + 10 - 5;
      this.game.spaceship.keepEngineOn = true;
      this.game.spaceship.goTo(gameTitleX, gameTitleY - 48 - 28, {
        speed: [0.2, 0.2],
      });
      let speedInterval = setInterval(() => {
        this.game.spaceship.speedY = Math.max(
          this.game.background.speedY * 0.1,
          0.2
        );
        if(this.game.background === 7){
          clearInterval(speedInterval)
        }
      }, 1000 / 144);
    }, 4000);
    // Set state to DONELOADING (title and press start button appears)
    setTimeout(() => {
      this.state = "DONELOADING";
    }, 7500);
    
    this.interval = setInterval(() => {
      this.#clear();
      this.#update();
    }, 1000 / 144); // 144 frames per second
  }

  changeScreen() {
    
  }
}
