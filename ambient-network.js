(() => {
  const canvas = document.getElementById("ambient-network");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const palette = ["20,214,201", "56,143,255", "13,178,181", "92,170,255", "160,230,255"];
  let nodes = [];
  let stars = [];
  let width = 0;
  let height = 0;
  let frame;
  let lastTime = 0;

  const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

  function seed() {
    const count = Math.max(34, Math.min(58, Math.round((width * height) / 42000)));
    nodes = Array.from({ length: count }, (_, index) => ({
      x: random(0, width), y: random(0, height), radius: index % 7 === 0 ? random(5.5, 7.5) : random(2.15, 3.6),
      vx: random(-0.09, 0.09), vy: random(-0.07, 0.07), color: palette[index % palette.length], phase: random(0, Math.PI * 2),
    }));
    stars = Array.from({ length: Math.max(120, Math.min(240, Math.round((width * height) / 9000))) }, () => ({
      x: random(0, width), y: random(0, height), radius: random(.45, 1.35), alpha: random(.28, .76), phase: random(0, Math.PI * 2),
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
      const glow = context.createRadialGradient(x, y, 0, x, y, 350);
      glow.addColorStop(0, `rgba(${color},0.17)`);
      glow.addColorStop(1, `rgba(${color},0)`);
      context.fillStyle = glow;
      context.fillRect(x - 350, y - 350, 700, 700);
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
    const distanceLimit = Math.min(315, Math.max(195, width * .18));
    for (let first = 0; first < nodes.length; first += 1) for (let second = first + 1; second < nodes.length; second += 1) {
      const a = nodes[first], b = nodes[second], distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance > distanceLimit) continue;
      context.strokeStyle = `rgba(31,194,196,${(1 - distance / distanceLimit) * .5})`;
      context.lineWidth = 1;
      context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
    }
    nodes.forEach((node) => {
      const pulse = .82 + Math.sin(time / 1800 + node.phase) * .18;
      context.beginPath(); context.fillStyle = `rgba(${node.color},${.84 * pulse})`;
      context.shadowBlur = node.radius * 11;
      context.shadowColor = `rgba(${node.color},1)`;
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
