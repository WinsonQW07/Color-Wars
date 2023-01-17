export default class Rect {
    constructor(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
      this.height = height;
    }
    
    // http://24bitjs.com/2014-11-how-to-detect-if-a-point-is-inside-a-rectangle-in-javascript/
      containsPoint(point) {
          if (this.width <= 0 || this.height <= 0) return false;
          return (point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height);
      }
    
  }