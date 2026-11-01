// A column that grows for twelve years. Merz.bau() keeps the pieces, the years and the plaster;
// the sketch chooses the material, the camera and the floor. WEBGL mode.
let bau;
let jahr = 11;
let schnitt = 0;

async function setup() {
  createCanvas(600, 820, WEBGL).parent('drawing');
  pixelDensity(1);
  const farbe = Merz.farbe;
  const grotesk = await Merz.schrift('grotesk');
  const found = await Merz.fundsachen('017', { variant: 'scan' });

  bau = Merz.bau({ seed: 1923, grund: [160, 160], hoehe: 52, boden: 300 });
  const words = ['MERZ', 'NASCI', '1923', 'i', 'DADA', '21'];
  const parts = [['R', 'bowl'], ['K', 'upper-branch'], ['A', 'crossbar'], ['Y', 'fork']];
  for (let year = 1; year <= 12; year++) {
    // Geometric letters become beams; a letter part is a beam on its own.
    bau.fund(words[year % words.length], { size: 36 + (year % 4) * 12, weight: 0.6, color: year % 3 ? farbe.schwarz : farbe.rot });
    const [letter, name] = parts[year % parts.length];
    bau.fund(Merz.bauteil(letter, name, { size: 60 + (year % 3) * 20 }), { color: year % 2 ? farbe.blau : farbe.schwarz });
    // Text from the printer's case is extruded from the font itself.
    if (year % 2 === 0) bau.fund('Merz', { font: grotesk, size: 34, weight: 700, color: farbe.gelb });
    // A found piece stands as a printed plane.
    if (year % 4 === 1) bau.fund(found, { breite: 90 });
    // Every third year the plaster covers what is there, not always all the way up.
    if (year % 3 === 0) bau.gips({ deels: year === 12 ? 1 : 0.8, open: 0.2 });
    bau.jahr();
  }
  camera(0, -120, 1400, 0, 20, 0, 0, 1, 0);
  controls();
}

function draw() {
  if (!bau) return;
  background(Merz.farbe.grau);
  orbitControl(1, 1, 0.1);
  // The floor is the sketch's own; it needs no light.
  push(); noStroke(); fill(236, 236, 230); translate(0, 301, 0); rotateX(HALF_PI); plane(900, 900); pop();
  bau.zeichne({ jahr, schnitt });
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('saeule', 'png');
  if (keyCode === RIGHT_ARROW) jahr = min(12, jahr + 1);
  if (keyCode === LEFT_ARROW) jahr = max(1, jahr - 1);
  if (keyCode === UP_ARROW) schnitt = min(1, schnitt + 0.1);
  if (keyCode === DOWN_ARROW) schnitt = max(0, schnitt - 0.1);
}

// Two sliders on the page, when it has them. The keys above do the same.
function controls() {
  const bind = (id, apply) => {
    const input = document.getElementById(id);
    if (!input) return;
    const out = document.getElementById(id + '-out');
    const update = () => { apply(Number(input.value)); if (out) out.textContent = input.value; };
    input.addEventListener('input', update);
    update();
  };
  bind('jahr', value => { jahr = value; });
  bind('schnitt', value => { schnitt = value / 100; });
}
