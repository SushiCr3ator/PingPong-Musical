class ParticleSystem {
  //will first go through constructor and set variables needed for most of the following functions
  constructor(x, y, maxi, r, g, b) {
    this.origin = createVector(x, y);
    this.particles = [];
    this.maxParticles = maxi;
    this.colour = color( r, g, b);

    //spawns the particles from the class Particle
    for (let i = 0; i < maxi; i++) {
      this.particles.push(new Particle(this.origin.x, this.origin.y, this.colour));
    }
  }

  run() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      //calls up the created particle in class Particle as p and does the function in tat class
      let p = this.particles[i];
      p.applyForce(createVector(0, 0.01));
      p.update();
      p.show();

      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  isDead() {
    return this.particles.length === 0;
  }
}

/* ----------------particle---------------- */

class Particle {
  constructor(x, y, newColour) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(1, 3)); // calculates vectors for vel
    this.acceleration = createVector(0, 0);
    this.col = newColour;
    this.lifespan = 255;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    //counts till 255 bfr they have to disappear
    this.lifespan -= 3;
  }

  show() {
    let c = this.col;
    stroke(0, this.lifespan);
    fill( red(c), green(c), blue(c), this.lifespan);
    square(this.position.x, this.position.y, 8);
  }

  isDead() {
    return this.lifespan < 0;
  }
}
