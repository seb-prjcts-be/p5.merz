// The cover facts of Merz 8/9 set as a poster in geometric letters, numerals and punctuation.
let poster;

function setup() {
  createCanvas(700, 900).parent('poster');
  noLoop();
  const farbe = Merz.farbe;
  poster = Merz.create({ width: 700, height: 900 });
  poster.plane(60, 405, 220, 180, { color: farbe.blau });
  poster.text('MERZ\n8/9', 60, 70, { size: 110, leading: 145, spacing: 18 });
  poster.line(60, 370, 640, 370, { color: farbe.rot, strokeWeight: 12 });
  poster.text('NASCI', 320, 420, { size: 52, spacing: 10, color: farbe.rot });
  poster.text('BAND 2, NR. 8/9', 60, 640, { size: 30, spacing: 6 });
  poster.text('APRIL / JULI 1924', 60, 715, { size: 26, spacing: 5 });
  poster.text('NATUR VON LAT. NASCI', 60, 780, { size: 22, spacing: 5 });
  describe('A poster with the cover facts of Merz 8/9: the title and issue numbers, NASCI in red beside a blue plane, then volume, months and year in geometric letters.');
  document.getElementById('save-poster').addEventListener('click', () => poster.downloadSVG('p5.merz-poster.svg'));
}

function draw() {
  poster.draw();
}
