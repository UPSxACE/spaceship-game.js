// Background MUST be 400x400
class Background {
  /**
   *
   * @param {CanvasRenderingContext2D} context
   * @param {String} imgSource
   * @param {Number} width
   * @param {Number} height
   */
  constructor(context, imgSource, width, height) {
    this.context = context;
    this.image = new Image(width, height);
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
    this.image.onload = () => (this.ready = true);
    this.image.src = imgSource;
  }

  draw() {
    if (this.ready) {
      this.context.drawImage(this.image, this.x, this.y - this.height);
      this.context.drawImage(this.image, this.x, this.y);
      this.context.drawImage(this.image, this.x, this.y + this.height);

      if (this.y < this.height) {
        this.y += 0.1;
      }
      if (this.y >= this.height) {
        this.y = 0;
      }
    }
  }
}
