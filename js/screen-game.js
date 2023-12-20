class ScreenGame {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.state = "LOADING";
  }

  #clear() {
    this.game.context.clearRect(0, 0, this.game.width, this.game.height);
  }

  #update() {
    this.game.background.draw();
    this.game.spaceship.draw();
  }

  load() {
    this.game.spaceship.keepEngineOn = false;
    this.game.spaceship.keepEngineOff = false;
    this.game.spaceship.speedX = 1;
    this.game.spaceship.speedY = 1;

    const x = this.game.width / 2 - 24;
    const y = this.game.height - 60;
    this.game.background.changeSpeedY(1.05, 0.002);
    this.game.spaceship.goTo(x, y, {
      onArrival: () => (this.game.spaceship.controllable = true),
      speed: [1, 1],
    });

    this.interval = setInterval(() => {
      this.#clear();
      this.#update();
    }, 1000 / 144); // 144 frames per second
  }
}
