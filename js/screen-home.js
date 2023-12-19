class ScreenHome {
  /**
   * @param {Game} game
   */
  constructor(game) {
    this.game = game;
    this.state = null;
  }

  #drawTitle() {
    this.game.context.beginPath();
    this.game.context.font = "20px 'Press Start 2P'"; // starts at 16 ends at 32
    this.game.context.fillStyle = "rgba(255, 255, 255, 1)";

    const text = "Spaceship Game";
    const measurement = this.game.context.measureText(text); // TextMetrics object
    const tWidth = measurement.width;

    const x = this.game.width / 2 - tWidth / 2;
    const y = this.game.height / 2 + 10 - 5;
    this.game.context.fillText(text, x, y, 360);
    this.game.context.closePath();
  }

  #drawPressStart() {
    this.game.context.beginPath();
    this.game.context.font = "12px 'Press Start 2P'"; // starts at 16 ends at 32
    this.game.context.fillStyle = "rgba(255, 255, 255, 1)";

    const text = "Press Start";
    const measurement = this.game.context.measureText(text); // TextMetrics object
    const tWidth = measurement.width;

    const x = this.game.width / 2 - tWidth / 2;
    const y = this.game.height / 2 + 10 + 20 - 5;
    this.game.context.fillText(text, x, y, 360);
    this.game.context.closePath();
  }

  #clear() {
    this.game.context.clearRect(0, 0, this.game.width, this.game.height);
  }

  #update() {
    this.game.background.draw();
    this.#drawTitle();
    this.#drawPressStart();
  }

  load() {
    this.state = "LOADING";
    this.interval = setInterval(() => {
      this.#clear();
      this.#update();
    }, 1000 / 144); // 144 frames per second
  }

  changeScreen() {}
}
