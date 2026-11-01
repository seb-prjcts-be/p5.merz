// A sheet that grows for six years. Merz.blatt() keeps the pieces and their years;
// the sketch chooses the material and decides when a layer covers part of the page.
let blatt;
let jahr = 6;

async function setup() {
  createCanvas(600, 760).parent('drawing');
  noLoop();
  const farbe = Merz.farbe;
  const found = await Merz.fundsachen('003');

  blatt = Merz.blatt({ seed: 8 });
  const words = ['MERZ', 'i', '1923', 'NASCI', 'DADA', '21'];
  for (let year = 1; year <= 6; year++) {
    // Pieces without x and y are placed by the sheet, from its seed.
    blatt.fund(words[year - 1], { size: 60 + year * 14, weight: 0.7, color: year % 2 ? farbe.schwarz : farbe.rot, angle: year % 3 ? 0 : 90 });
    blatt.fund(String(1923 + year), { font: 'grotesk', size: 18, weight: 500, stretch: 87 });
    blatt.fund(Merz.bauteil('K', 'upper-branch', { size: 120 }), { color: farbe.blau });
    if (year === 2 || year === 5) blatt.fund(found, { scale: 0.5 });
    // Every second year two planes cover part of what came before.
    if (year % 2 === 0) blatt.ueberbauen({ deckend: 0.25, teile: 2, color: year === 4 ? farbe.gelb : farbe.grau });
    blatt.jahr();
  }
}

function draw() {
  background(Merz.farbe.grau);
  blatt.zeichne({ jahr });
  Merz.stempel(String(jahr), 548, 740, { size: 14, weight: 500, font: 'monospace' });
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) jahr = min(6, jahr + 1);
  if (keyCode === LEFT_ARROW) jahr = max(1, jahr - 1);
  if (key === 's' || key === 'S') saveCanvas('blatt', 'png');
  redraw();
}
