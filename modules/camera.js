// modules/camera.js

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.interpolationSpeed = 0.08;
    }

    update(targetX) {
        // Smoothly interpolate camera.x to target.x
        this.x += (targetX - this.x) * this.interpolationSpeed;
    }

    // Convert world coordinates to screen coordinates
    getDrawX(worldX) {
        return worldX - this.x;
    }

    // Resize handling if we want to change camera offsets
    resize(width, height) {
        this.viewWidth = width;
        this.viewHeight = height;
    }
}
