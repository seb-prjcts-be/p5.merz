// Letter parts set free from the alphabet: bowls, stems, legs and forks in a p5 loop.
function setup() {
  createCanvas(600, 760).parent('drawing');
  noLoop();
  const farbe = Merz.farbe;
  background(farbe.grau);

  // A quiet blue plane and a red rule hold the open space together.
  noStroke();
  fill(farbe.blau);
  rect(350, 60, 190, 250);
  stroke(farbe.rot);
  strokeWeight(10);
  line(50, 440, 540, 440);

  // Five bowls of an R turning and growing across the page; every second one is turned over.
  for (let i = 0; i < 5; i++) {
    push();
    translate(95 + i * 92, 230);
    rotate(-0.35 + i * 0.22);
    Merz.bauteil('R', 'bowl', -45, -60, {
      size: 110 + i * 16,
      weight: 0.6,
      mirror: i % 2 === 1,
      color: i === 2 ? farbe.rot : farbe.schwarz
    });
    pop();
  }

  // All named parts of K drawn in three colours, plus four stepped Y forks. The three lines below name the parts and sizes used.
  const parts = Merz.bauteile('K', { size: 190, weight: 0.65 });
  const colors = [farbe.schwarz, farbe.rot, farbe.blau];
  parts.forEach((part, i) => Merz.stempel(part, 55 + i * 18, 475, { color: colors[i] }));

  Merz.stempel(Merz.bauteil('Y', 'fork', { size: 54, weight: 0.5 }), 310, 505, {
    repeat: 4,
    stepX: 58,
    stepY: 16,
    color: [farbe.schwarz, farbe.rot]
  });

  Merz.stempel('BAUTEILE', 50, 95, { size: 42, weight: 900, stretch: 112, spacing: 4 });
  Merz.stempel(['R BOWL 110 126 142 158 174', 'K LEFT-STEM UPPER-BRANCH', 'K LOWER-STEM'], 310, 665, {
    size: 13,
    weight: 600,
    stretch: 87,
    leading: 20,
    spacing: 2
  });
  describe('Five rotated bowls of the letter R, every second one turned over, across a blue rectangle, the separated parts of a K in black, red and blue below a red line, and four stepped Y forks.');
}
