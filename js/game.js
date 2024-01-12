const soundtrack = new Audio("audio/soundtrack.mp3");

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
  }

  /** Load game, in the initial screen */
  init() {
    this.currentScreen.load();
    soundtrack.currentTime = 0;
    soundtrack.volume = 0.25;
    soundtrack.loop = true;
    soundtrack.play();
  }
}
