(() => {
  const canvas = document.getElementById("ambient-network");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const palette = ["155,219,175", "114,217,195", "155,205,227", "192,166,231", "231,183,108"];
  let nodes = [];
  let stars = [];
  let width = 0;
  let height = 0;
  let frame;
  let lastTime = 0;

  const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

  function seed() {
    const count = Math.max(28, Math.min(46, Math.round((width * height) / 52000)));
    nodes = Array.from({ length: count }, (_, index) => ({
      x: random(0, width), y: random(0, height), radius: index % 7 === 0 ? random(4.2, 5.8) : random(1.45, 2.45),
      vx: random(-0.09, 0.09), vy: random(-0.07, 0.07), color: palette[index % palette.length], phase: random(0, Math.PI * 2),
    }));
    stars = Array.from({ length: Math.max(72, Math.min(160, Math.round((width * height) / 13000))) }, () => ({
      x: random(0, width), y: random(0, height), radius: random(.35, 1.15), alpha: random(.16, .52), phase: random(0, Math.PI * 2),
    }));
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    seed();
    draw(0, false);
  }

  function draw(time, move) {
    context.clearRect(0, 0, width, height);
    [[width * .15, height * .22, "114,217,195"], [width * .82, height * .36, "155,205,227"], [width * .68, height * .84, "192,166,231"]].forEach(([x, y, color]) => {
      const glow = context.createRadialGradient(x, y, 0, x, y, 310);
      glow.addColorStop(0, `rgba(${color},0.09)`);
      glow.addColorStop(1, `rgba(${color},0)`);
      context.fillStyle = glow;
      context.fillRect(x - 310, y - 310, 620, 620);
    });
    stars.forEach((star) => {
      const twinkle = .76 + Math.sin(time / 1400 + star.phase) * .24;
      context.beginPath();
      context.fillStyle = `rgba(187,211,222,${star.alpha * twinkle})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });
    if (move) nodes.forEach((node) => {
      node.x += node.vx; node.y += node.vy;
      if (node.x < -20 || node.x > width + 20) node.vx *= -1;
      if (node.y < -20 || node.y > height + 20) node.vy *= -1;
    });
    const distanceLimit = Math.min(270, Math.max(170, width * .16));
    for (let first = 0; first < nodes.length; first += 1) for (let second = first + 1; second < nodes.length; second += 1) {
      const a = nodes[first], b = nodes[second], distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance > distanceLimit) continue;
      context.strokeStyle = `rgba(54,179,176,${(1 - distance / distanceLimit) * .29})`;
      context.lineWidth = .8;
      context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
    }
    nodes.forEach((node) => {
      const pulse = .82 + Math.sin(time / 1800 + node.phase) * .18;
      context.beginPath(); context.fillStyle = `rgba(${node.color},${.36 * pulse})`;
      context.shadowBlur = node.radius * 8;
      context.shadowColor = `rgba(${node.color},.85)`;
      context.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2); context.fill();
      context.shadowBlur = 0;
    });
  }

  function animate(time) { draw(time, true); frame = requestAnimationFrame(animate); }
  function applyMotionPreference() {
    cancelAnimationFrame(frame);
    if (reducedMotion.matches) { draw(0, false); return; }
    frame = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(frame); else applyMotionPreference(); });
  reducedMotion.addEventListener?.("change", applyMotionPreference);
  resize();
  applyMotionPreference();
})();
