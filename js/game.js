const loadSprite = (url) => {
  const img = new Image(48, 48);
  img.src = url;
  return img;
};

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
    this.currentScreen = new ScreenHome(this);
    this.spaceship = new Spaceship(this);
    // this.spaceship
    // this.bullets
    // this.obstacles
  }

  init() {
    this.currentScreen.load();
  }
}
