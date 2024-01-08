import { fabric } from 'fabric';

//const dogStill = { left: '/sprites/dog-still-left.png', right: '/sprites/dog-still-right.png' };
/*const dogWalk = {
  left: ['/sprites/dog-walk-left-1.png', '/sprites/dog-walk-left-2.png', '/sprites/dog-walk-left-3.png', '/sprites/dog-walk-left-2.png'],
  right: ['/sprites/dog-walk-right-1.png', '/sprites/dog-walk-right-2.png', '/sprites/dog-walk-right-3.png', '/sprites/dog-walk-right-2.png']
};*/

const dogStill = '/sprites/dog-still-left.png';
const dogWalk = ['/sprites/dog-walk-left-1.png', '/sprites/dog-walk-left-2.png', '/sprites/dog-walk-left-3.png', '/sprites/dog-walk-left-2.png'];

const spriteWidth = 150;

export default class Dog {
  constructor(inputElementCoords, squareElementCoords, pickupNumber, canvas, onFinished) {
    this.canvas = canvas;
    this.onFinished = onFinished;

    this.squareCoords = {
      x: squareElementCoords.x + 12,
      y: squareElementCoords.y - 18
    };

    this.startCoords = {
      x: canvas.width,
      y: this.squareCoords.y
    };

    this.coords = { ...this.startCoords };

    this.pickupNumber = pickupNumber.toString();
    this.imageStage = 0;
    this.walking = true;

    this.completed = false;

    this.heldNumber = new fabric.Text(this.pickupNumber, {
      fontFamily: "ConnectionII",
      fontSize: 30,
      fill: 'rgb(56,56,56)'
    });

    fabric.Image.fromURL(this.getImage(), img => {

      this.sprite = img;
      this.sprite.scaleToWidth(spriteWidth);
      this.sprite.set({
        left: 20
      });
      this.sprite.setCoords();

      this.group = new fabric.Group([this.heldNumber, this.sprite]);
      this.setCoords();

      canvas.add(this.group).renderAll();
    });
  };

  setCoords() {
    this.group.set({
      left: this.coords.x,
      top: this.coords.y,
    });

    this.group.setCoords();
  }

  updateCoords() {
    if (this.walking) {
      this.coords.x -= 20;
    }

    this.setCoords();
  }

  getImage() {
    return this.walking ? dogWalk[this.imageStage] : dogStill;
  }

  nextImage() {
    if (this.walking) {
      this.imageStage = (this.imageStage + 1) % dogWalk.length;
    }

    // force sprite change
    this.group.removeWithUpdate(this.sprite);

    this.sprite.setSrc(this.getImage());
    this.group.addWithUpdate(this.sprite);
  }

  update() {
    if (!this.group) return;
    if (this.completed) {
      this.canvas.remove(this.group);
      return "delete";
    }

    this.nextImage();
    this.updateCoords();

    if (this.coords.x < this.squareCoords.x) {
      this.walking = false;
      this.heldNumber.set({ text: '' })
      this.onFinished();

      setTimeout(() => this.completed = true, 2000);
    }
  }
}