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
    this.collided = false;
  }

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

    this.#drawImageRotated(bulletSprite, x, y, angle);

    this.y -= this.speedY;
  }
}
