import { fabric } from 'fabric';
import Dog from './Dog';

class DogController {
    constructor() {
        let { width, height } = document.getElementById("root").getBoundingClientRect();
        this.canvas = new fabric.Canvas('base-canvas', { width, height });
        this.dogs = new Set();
        this.counter = 0;
        this.levels = new Set();
    }

    addLevel(y) {
        this.levels.add(y);
    }

    sortedLevels() {
        return Array.from(this.levels).sort();
    }

    getLevel(index) {
        return this.sortedLevels()[index];
    }

    addDog(startCoords, pickupNumber, endCoords, onFinished) {
        if (this.dogs.size === 0) {
            this.interval = setInterval(() => this.update(), 400);
        }

        this.dogs.add(new Dog(startCoords, endCoords, pickupNumber, this.canvas, onFinished));
    }

    update() {
        let toRemove = new Set();

        for (let dog of this.dogs) {
            if (dog.update() === "delete") {
                toRemove.add(dog);
            }
        }

        for (let dog of toRemove) {
            this.dogs.delete(dog);
        }

        if (this.dogs.size === 0) {
            clearInterval(this.interval);
        }

        this.canvas.renderAll();
    }
}

let singleton = new DogController();
export default singleton;