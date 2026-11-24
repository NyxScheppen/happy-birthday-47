import { useEffect, useRef } from 'react';

const fullCircle = Math.PI * 2;

function drawSunburst(sunburst) {
  const ctx = sunburst.getContext("2d");
  if (!ctx) return;
  const width = sunburst.clientWidth;
  const height = sunburst.clientHeight;
  if (!width || !height) return;

  const resolution = Math.min(window.devicePixelRatio || 1, 2);
  sunburst.width = Math.round(width * resolution);
  sunburst.height = Math.round(height * resolution);
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  const unit = Math.min(width / 610, height / 425);
  ctx.translate(width / 2, height * .50);
  ctx.scale(unit, unit);

  const sunlight = ctx.createRadialGradient(0, 0, 65, 0, 0, 222);
  sunlight.addColorStop(0, '#ffce66ae');
  sunlight.addColorStop(.56, '#ffda7f84');
  sunlight.addColorStop(1, '#ffe4a000');
  ctx.fillStyle = sunlight;
  ctx.fillRect(-222, -222, 444, 444);

  const rays = ctx.createRadialGradient(0, 0, 76, 0, 0, 272);
  rays.addColorStop(0, '#ffedb600');
  rays.addColorStop(.46, '#ffc9535e');
  rays.addColorStop(1, '#ffd16900');
  ctx.fillStyle = rays;
  for (let index = 0; index < 16; index += 1) {
    const angle = fullCircle * index / 16 + .09;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 272, angle, angle + .16);
    ctx.closePath();
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 164, 0, fullCircle);
  ctx.strokeStyle = '#eab75c64';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  const stars = [
    [-227, -88, 13, '#e97d62'], [218, -71, 15, '#55a6cb'],
    [-183, 41, 9, '#65a9c6'], [175, -138, 8, '#efa833'],
    [238, 47, 11, '#ed9267'], [-237, 82, 11, '#eab04e'],
  ];
  for (const [x, y, radius, color] of stars) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.quadraticCurveTo(radius * .17, -radius * .21, radius * .83, 0);
    ctx.quadraticCurveTo(radius * .17, radius * .21, 0, radius);
    ctx.quadraticCurveTo(-radius * .17, radius * .21, -radius * .83, 0);
    ctx.quadraticCurveTo(-radius * .17, -radius * .21, 0, -radius);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  const dashes = [
    [-258, -13, -.87, '#e9a33b'], [-148, -144, .78, '#75bbd5'],
    [246, -112, .85, '#edab2d'], [191, 76, -.48, '#73b8bd'],
    [-271, 105, -.44, '#f1a169'], [275, -1, .71, '#e0827a'],
    [-137, -174, -.51, '#f1a169'], [116, -155, .93, '#79bccf'],
  ];
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  for (const [x, y, tilt, color] of dashes) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  }
}

export default function Sunburst() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    drawSunburst(canvas);
    const observer = new ResizeObserver(() => drawSunburst(canvas));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return <canvas ref={canvasRef} className="sunburst" aria-hidden="true" />;
}
