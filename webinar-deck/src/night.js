// Second design ("City Lights"): same slides and prices as the main deck, restyled by night.css,
// with a particle background and one extra proof slide.
import { slides } from './slides.js';
import { startDeck } from './core.js';
import { initLights } from './bg-lights.js';

// Read from MagicBolt's own Google Business Profile through the MagicBolt connector on 13 Oct 2026.
const LIVE = { reviews: 693, rating: 4.9, profiles: 30 };

const proof = {
  form: 'corners',
  html: `<img class="corner-logo" src="assets/logo.png" alt="MagicBolt AI"><div class="kicker a left">Live from our own dashboard</div>
    <h1>We Run on What <span class="g">We Sell</span></h1>
    <div class="split" style="grid-template-columns:1fr 1fr">
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="tile a pop" style="--i:2;--c:var(--gold)"><div class="stat g shine"><span data-count="${LIVE.reviews}">0</span></div><p>Google reviews on MagicBolt’s own profile</p></div>
        <div class="tile a pop" style="--i:3;--c:var(--blue)"><div class="stat g2 shine">${LIVE.rating}</div><p>Average star rating</p></div>
      </div>
      <div class="rows">
        <div class="row a left" style="--i:4;--c:var(--orange)"><img src="assets/ico/robot.png" alt="">AI replies to every review</div>
        <div class="row a left" style="--i:5;--c:var(--pink)"><img src="assets/ico/office_building.png" alt="">${LIVE.profiles}+ business profiles on one login</div>
        <div class="row a left" style="--i:6;--c:var(--green)"><img src="assets/ico/glowing_star.png" alt="">The same tools you will resell</div>
      </div>
    </div>`,
};

const trust = slides.findIndex((s) => s.html.includes('A Partner You Can'));
const deck = [...slides.slice(0, trust + 1), proof, ...slides.slice(trust + 1)];

document.documentElement.classList.add('night');
startDeck(deck, initLights, { allDark: true });
