const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const mouse = {
  x: null,
  y: null,
  rad: 200,
};
(canvas.width = innerWidth), (canvas.height = innerHeight);
class Particle {
  constructor(color, effect) {
    this.color = color;
    this.effect = effect;
    this.radius = Math.random() * (10 - 5 + 1) + 5;
    this.buffer = 4 * this.radius;
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius +
      Math.random() * (this.effect.height - this.radius * 2);
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.95;
  }
  draw(context) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();
  }
  update() {
    if (this.effect.mouse.onMove) {
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = distance / this.effect.mouse.radius;
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }
    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;
    if (this.x < this.buffer) {
      this.x = this.buffer;
      this.vx *= -1;
    } else if (this.x > this.effect.width - this.buffer) {
      this.x = this.effect.width - this.buffer;
      this.vx *= -1;
    }
    if (this.y < this.buffer) {
      this.y = this.buffer;
      this.vy *= -1;
    } else if (this.y > this.effect.height - this.buffer) {
      this.y = this.effect.height - this.buffer;
      this.dy *= -1;
    }
  }
  reset() {
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius +
      Math.random() * (this.effect.height - this.radius * 2);
  }
}

class Effect {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 100;
    this.createParticles();
    this.mouse = {
      x: null,
      y: null,
      onMove: false,
      radius: 100,
    };
    window.addEventListener("resize", (e) =>
      this.resize(e.target.window.innerWidth, e.target.window.innerHeight)
    );
    window.addEventListener("mousemove", (e) => {
      this.mouse.onMove = true;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    window.addEventListener(
      "mouseout",
      (e) => (this.mouse.onMove = false)
    );
  }
  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      const color = `hsl(${
        ((this.numberOfParticles / (i + 1)) * 360) / Math.PI
      }, 100%, 50%)`;
      this.particles.push(new Particle(color, this));
    }
  }
  handleParticles(context) {
    this.connectParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
  connectParticles(context) {
    const maxDistance = 200;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          context.save();
          const opacity = 1 - distance / maxDistance;
          const gradient = context.createLinearGradient(
            this.particles[a].x,
            this.particles[a].y,
            this.particles[b].x,
            this.particles[b].y
          );
          gradient.addColorStop(0, this.particles[a].color);
          gradient.addColorStop(1, this.particles[b].color);
          context.strokeStyle = gradient;
          context.lineWidth =
            (this.particles[a].rad + this.particles[b].rad) / 8;
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.stroke();
          context.restore();
        }
      }
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.particles.forEach((particle) => {
      particle.reset();
    });
  }
}
const effect = new Effect(canvas, ctx);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}
animate();