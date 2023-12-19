class Game {
  /**
   * @param {HTMLCanvasElement} canvaNode
   */
  constructor(canvaNode) {
    this.canva = canvaNode;
    /** @type {Number} */
    this.width = this.canva.style.width;
    /** @type {Number} */
    this.height = this.canva.style.height;
    /** @type {CanvasRenderingContext2D} */
    this.context = this.canva.getContext("2d");
    this.background = new Background(this.context, "img/bg.png", 400, 400);
  }

  #clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  #update() {
    this.background.draw();
  }

  init() {
    setInterval(() => {
      this.#clear();
      this.#update();
    }, 1000 / 144); // 144 frames per second
  }
}
