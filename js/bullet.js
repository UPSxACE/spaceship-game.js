const loadBulletSprite = (url) => {
  const img = new Image(8, 24);
  img.src = url;
  return img;
};

const bulletSprite = loadBulletSprite("img/bullet.png");

class Bullet {
  constructor(game, initialX, initialY) {
    this.context = game.context;
    this.canva = game.canva;
    this.x = initialX;
    this.y = initialY;
    this.speedX = 0;
    this.speedY = 1.5;
    this.width = 8;
    this.height = 24;
  }

  /**
   * This private method draws the image on the canvas in the position specified,
   * rotated by the given angle.
   * @param {HTMLImageElement} image
   * @param {Number} x
   * @param {Number} y
   * @param {Number} rotation
   */
  #drawImageRotated(image, x, y, rotation) {
    const scale = 1;
    this.context.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
    this.context.rotate(rotation);

    this.context.drawImage(
      image,
      -image.height / 2,
      -image.width / 2,
      this.height,
      this.width
    );

    this.context.setTransform(1, 0, 0, 1, 0, 0); // reset scale and origin
  }

  draw() {
    const x = this.x;
    const y = this.y;
    const angle = -((Math.PI * 90) / 180); // 90 degrees anti clock-wise

    // The original sprite for the bullet is drawn horizontally,
    // but in the game it must be rotated so it is drawn vertically
    this.#drawImageRotated(bulletSprite, x, y, angle);

    // Move the bullet up
    this.y -= this.speedY;
  }
}
