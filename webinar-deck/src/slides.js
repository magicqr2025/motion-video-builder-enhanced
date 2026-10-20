// All webinar content lives here. Edit text and prices, then run build.cmd.

export const PRICES = {
  programRegular: 25000,
  programOffer: 10000,
  bundleRegular: 100000,
  bundleOffer: 24000,
  avgClientFee: 8000, // used on the earnings maths slide
};

export const CONTACT = {
  web: 'www.magicbolt.ai',
  email: 'contact@magicbolt.ai',
  phones: '+91 62632 06697 · +91 79873 15256',
};

const C = ['var(--orange)', 'var(--blue)', 'var(--pink)', 'var(--purple)', 'var(--green)', 'var(--gold)'];
const inr = (n) => '₹' + n.toLocaleString('en-IN');
const ic = (name) => `<img src="assets/ico/${name}.png" alt="">`;

const tile = (icon, title, sub, i, cls = '') =>
  `<div class="tile a pop ${cls}" style="--i:${i};--c:${C[i % C.length]}"><div class="badge3d"><span class="bob" style="--i:${i}">${ic(icon)}</span></div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>`;
const grid = (cols, items, cls = '') =>
  `<div class="grid" style="grid-template-columns:repeat(${cols},1fr)">${items.map((t, i) => tile(t[0], t[1], t[2], i, cls)).join('')}</div>`;
const head = (kicker, title) =>
  `<img class="corner-logo" src="assets/logo.png" alt="MagicBolt AI"><div class="kicker a left">${kicker}</div><h1>${title}</h1>`;
const row = (icon, text, i) => `<div class="row a left" style="--i:${i + 2};--c:${C[i % C.length]}">${ic(icon)}${text}</div>`;
const face = (img, c) => `<div class="face" style="--c:${c}"><span class="bob">${ic(img)}</span></div>`;
const person = (img, name, tag, line, i) =>
  `<div class="tile a pop" style="--i:${i + 2};--c:${C[i]}">${face(img, C[i])}<h3>${name}</h3><p>${line}</p><span class="tag">${tag}</span></div>`;

// The real logo, cut into parts that build one after another (ported from the Remotion LogoAnim).
const logoAnim = (w) =>
  `<div class="lg" style="--lw:${w}px"><div class="glow"></div><i class="shield"></i><i class="m1"></i><i class="m2"></i><i class="bolt"></i><i class="ai"></i><i class="tagline"></i><div class="sweep"></div></div>`;

const roles = [['artist_palette', 'Designer'], ['clapper_board', 'Video editor'], ['pencil', 'Script writer'], ['memo', 'Content writer'], ['megaphone', 'Marketer'], ['briefcase', 'Manager']];

const programs = [
  ['robot', 'AI & Marketing Training', ['AI posts & videos', 'UGC planning', 'Live classes']],
  ['identification_card', 'QR & NFC Business', ['Digital card', 'Digital menu', 'Review QR']],
  ['puzzle_piece', 'Software Reselling', ['Instant website', 'WhatsApp CRM', 'Booking system']],
  ['high_voltage', 'Automation Agency', ['Google & social', 'AI review replies', 'One dashboard']],
];

// form = 3D background formation, bolt = [x, y, size] of the 3D bolt (fractions of the stage), dark = navy slide
export const slides = [
  { form: 'burst', html: `
    <div class="split" style="grid-template-columns:1.3fr .7fr;padding-top:0">
      <div class="rows" style="gap:34px">
        ${logoAnim(620)}
        <h1 class="xl">Build Your Own<br><span class="g">Digital &amp; AI Agency</span></h1>
        <p class="lead a" style="--i:8">Be your own boss. Powered by AI and MagicBolt.</p>
        <div class="chips a" style="--i:10"><span class="chip fill pulse" style="--c:var(--deep)">${ic('video_camera')} Live webinar</span></div>
      </div>
      <div class="phone a right" style="--i:4">
        <video src="assets/webinar-reel.mp4" muted loop playsinline preload="auto"></video>
        <button class="snd" title="Sound on / off" aria-label="Toggle video sound">
          <svg class="off" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6"/></svg>
          <svg class="on" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>
        </button>
      </div>
    </div>` },

  { form: 'frame', html: `${head('Who is this for?', 'Meet Three People <span class="g">Like You</span>')}
    <div class="body"><div class="grid" style="grid-template-columns:repeat(3,1fr)">
      ${person('p-student', 'Rahul, 23', 'Fresher', 'Degree in hand, still looking for his first job.', 0)}
      ${person('p-priya', 'Priya, 31', 'Laid off', 'Lost her job and needs a fresh start.', 1)}
      ${person('p-anil', 'Anil, 45', 'Working professional', 'Has a job, but wants to earn more.', 2)}
    </div></div>` },

  { form: 'ring', cls: 'mid', html: `${head('One big dream', 'All Three Want the Same Thing')}
    <div class="body center" style="gap:34px">
      <div class="quote a pop" style="--i:3"><span class="g shine">“Be My Own Boss”</span></div>
      <div class="chips a" style="--i:6"><span class="chip" style="--c:var(--orange)">${ic('money_bag')} My own income</span><span class="chip" style="--c:var(--blue)">${ic('alarm_clock')} My own time</span><span class="chip" style="--c:var(--pink)">${ic('crown')} My own brand</span></div>
    </div>` },

  { form: 'sides', html: `${head('Reality check', 'Today’s <span class="g">Job Market</span>')}
    <div class="body">${grid(3, [
      ['worried_face', 'Too few good jobs', 'Thousands apply. Very few get selected.'],
      ['money_with_wings', 'Low pay', 'Long hours, but the salary stays small.'],
      ['hourglass_not_done', 'No security', 'A job can end any day, without warning.'],
    ])}</div>` },

  { form: 'wave', html: `${head('The turning point', 'What If You <span class="g2">Learn AI?</span>')}
    <div class="body"><div class="eq">
      ${tile('robot', 'AI skills', '', 0)}<div class="op a pop" style="--i:1">+</div>
      ${tile('toolbox', 'Right tools', '', 1)}<div class="op a pop" style="--i:3">+</div>
      ${tile('handshake', 'Expert support', '', 2)}<div class="op a pop" style="--i:5">=</div>
      ${tile('rocket', 'Your own agency', '', 3)}
    </div></div>` },

  { form: 'corners', dark: true, html: `${head('Who is guiding you', 'The <span class="g">MagicBolt</span> Team')}
    <div class="split" style="grid-template-columns:1fr .8fr">
      <div class="rows" style="gap:30px">
        <div class="grid" style="grid-template-columns:1fr 1fr">
          <div class="a pop" style="--i:2"><div class="stat g shine"><span data-count="15">0</span>+</div><div class="stat-label">years of IT and software experience</div></div>
          <div class="a pop" style="--i:4"><div class="stat g shine"><span data-count="1000">0</span>+</div><div class="stat-label">agencies and members guided</div></div>
        </div>
        <p class="lead a" style="--i:6">We help people build this same business every day.</p>
      </div>
      <div class="a right" style="--i:3;text-align:center"><img class="pic sway" src="assets/site/white-label-magicbolt.webp" alt="" style="max-height:640px"></div>
    </div>` },

  { form: 'frame', html: `${head('The basics', 'What Does a Digital Marketing Agency <span class="g">Do?</span>')}
    <div class="body">${grid(3, [
      ['globe_with_meridians', 'Online presence', 'Gets a business found on Google and social media.'],
      ['glowing_star', 'Reputation', 'Builds trust with reviews and ratings.'],
      ['chart_increasing', 'Client growth', 'Brings new customers, organic and paid.'],
    ])}</div>` },

  { form: 'topbot', html: `${head('Before AI', 'One Client Needed a <span class="g">Full Team</span>')}
    <div class="body">${grid(6, roles.map((r) => [r[0], r[1], '']), 'sm')}
      <p class="lead a" style="--i:8;text-align:center"><b>Six people. Six salaries.</b> Too costly to start alone.</p></div>` },

  { form: 'sides', html: `${head('Services', 'What Agencies <span class="g2">Offer</span>')}
    <div class="body">${grid(4, [
      ['mobile_phone', 'Social media', ''], ['round_pushpin', 'Google Business Profile', ''], ['magnifying_glass_tilted_left', 'Local SEO', ''], ['desktop_computer', 'Websites', ''],
      ['speech_balloon', 'WhatsApp automation', ''], ['card_index_dividers', 'CRM', ''], ['receipt', 'Billing', ''], ['busts_in_silhouette', 'HRM', ''],
    ], 'sm')}</div>` },

  { form: 'ring', html: `${head('After AI', 'Now <span class="g">One Person</span> Can Do It All')}
    <div class="split">
      <div class="orbit a pop" style="--i:2">
        <div class="halo"></div>
        <div class="ring">${roles.map((r, i) => `<div style="transform:rotate(${i * 60}deg) translateX(275px) rotate(${-i * 60}deg)"><span><em class="chip" style="--c:${C[i]}">${ic(r[0])} ${r[1]}</em></span></div>`).join('')}</div>
        <div class="hub">${face('p-rahul', 'var(--blue)')}</div>
      </div>
      <div class="rows" style="gap:30px">
        <div class="no a right" style="--i:3">${ic('cross_mark')}No coding</div>
        <div class="no a right" style="--i:4">${ic('cross_mark')}No design skills</div>
        <div class="no a right" style="--i:5">${ic('cross_mark')}No video editing</div>
        <div class="no a right" style="--i:7">${ic('check_mark_button')}<span class="g shine">Just AI, tools and training</span></div>
      </div>
    </div>` },

  { form: 'frame', html: `${head('Your customers', 'Who Can You <span class="g">Sell To?</span>')}
    <div class="body" style="gap:26px"><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:24px">${[
      ['restaurent-bar', 'Restaurants & hotels'], ['gym', 'Gyms & fitness'], ['salon-sap', 'Salons & spas'], ['realstate', 'Real estate'],
      ['institutes', 'Coaching & institutes'], ['tours-travel', 'Tours & travel'], ['service-industry', 'Home services'], ['pest-control', 'Pest control'],
    ].map((t, i) => `<div class="tile ind a pop" style="--i:${i};--c:${C[i % C.length]}"><img class="bob" style="--i:${i}" src="assets/site/${t[0]}.webp" alt=""><h3 style="font-size:29px">${t[1]}</h3></div>`).join('')}</div></div>` },

  { form: 'topbot', html: `${head('Ready packages', 'What to Pitch <span class="g2">Each Business</span>')}
    <div class="body"><div class="grid" style="grid-template-columns:repeat(4,1fr)">${[
      ['fork_and_knife_with_plate', 'Restaurant', ['Digital menu', 'MagicQR reviews', 'Google profile', 'Website']],
      ['stethoscope', 'Clinic', ['Google profile', 'Review automation', 'WhatsApp CRM', 'Website']],
      ['house', 'Real estate', ['Social automation', 'WhatsApp CRM', 'Lead management', 'AI content']],
      ['office_building', 'Multi-location', ['Google automation', 'Social automation', 'Review management', 'Reporting']],
    ].map((p, i) => `<div class="tile sm a pop" style="--i:${i + 2};--c:${C[i]}"><div class="badge3d"><span class="bob" style="--i:${i}">${ic(p[0])}</span></div><h3>${p[1]}</h3><ul>${p[2].map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div></div>` },

  // Tier 3 = low end and Tier 1 = high end of the ranges on the MagicBolt site; Tier 2 is a midpoint.
  { form: 'sides', html: `${head('Pricing', 'What You Can Charge <span class="g">Per Month</span>')}
    <div class="body" style="gap:26px"><div class="table">
      <div class="blank"></div>
      <div class="th a pop" style="--i:1;--c:var(--blue)">Tier 3 city</div><div class="th a pop" style="--i:2;--c:var(--purple)">Tier 2 city</div><div class="th a pop" style="--i:3;--c:var(--orange)">Tier 1 city</div>
      ${[
        ['fork_and_knife_with_plate', 'Restaurant', 7999, 10999, 14999],
        ['stethoscope', 'Clinic', 9999, 14999, 19999],
        ['house', 'Real estate', 14999, 21999, 29999],
        ['office_building', 'Multi-location', 25000, 35000, 50000],
      ].map((r, i) => `<div class="rh a left" style="--i:${i * 2 + 3}">${ic(r[0])}${r[1]}</div>${[2, 3, 4].map((k) => `<div class="td a pop" style="--i:${i * 2 + 2 + k}">₹<span data-count="${r[k]}">0</span></div>`).join('')}`).join('')}
    </div><p class="note a" style="--i:14">Suggested client prices. You decide your own pricing.</p></div>` },

  { form: 'wave', html: `${head('The maths', 'Small Client List. <span class="g">Real Income.</span>')}
    <div class="body" style="gap:22px"><div class="bars">${[[5, 130, 1], [10, 230, 3], [20, 360, 0]].map((b, i) => `
      <div class="bar" style="--c:${C[b[2]]}"><div class="amt a pop" style="--i:${i * 3 + 4}">₹<span data-count="${b[0] * PRICES.avgClientFee}">0</span></div>
      <div class="col a grow" style="--i:${i * 3 + 2};--h:${b[1]}px"></div>
      <div class="cap">${b[0]} clients</div></div>`).join('')}</div>
      <p class="lead a" style="--i:12;text-align:center">Per month, at an average of <b>${inr(PRICES.avgClientFee)}</b> per client.</p>
      <p class="note a" style="--i:13">Illustrative revenue, not guaranteed. Results depend on your effort, pricing and costs.</p></div>` },

  { form: 'corners', html: `${head('How MagicBolt AI helps', '<span class="g">Four Things</span> You Get')}
    <div class="body"><div class="grid" style="grid-template-columns:repeat(4,1fr)">${[
      ['gear', 'Automation software', 'Run every client from one place.'],
      ['identification_card', 'QR & NFC business', 'Digital cards, menus and review QR.'],
      ['puzzle_piece', 'Software to sell', 'Ready products under your brand.'],
      ['graduation_cap', 'Training & support', 'Classes, community and guidance.'],
    ].map((p, i) => `<div class="tile a pop" style="--i:${i + 2};--c:${C[i]}"><div class="num">0${i + 1}</div><div class="badge3d"><span class="bob" style="--i:${i}">${ic(p[0])}</span></div><h3>${p[1]}</h3><p>${p[2]}</p></div>`).join('')}</div></div>` },

  { form: 'sides', html: `${head('1 · Automation software', 'Every Client. <span class="g">One Dashboard.</span>')}
    <div class="split">
      <div class="rows" style="gap:34px">
        <div class="chips a" style="--i:2">${['Google Business Profile', 'Facebook', 'Instagram', 'WhatsApp', 'WordPress'].map((c, i) => `<span class="chip" style="--c:${C[i]}">${c}</span>`).join('')}</div>
        <p class="lead a" style="--i:4">AI writes posts, replies to reviews and schedules content for you.</p>
      </div>
      <div class="a right" style="--i:3;text-align:center"><img class="pic framed sway" src="assets/dashboard.png" alt=""></div>
    </div>` },

  { form: 'sides', html: `${head('2 · QR & NFC business', 'Start Selling From <span class="g2">Day One</span>')}
    <div class="split">
      <div class="grid" style="grid-template-columns:1fr 1fr">${[
        ['identification_card', 'Digital visiting card'], ['fork_and_knife_with_plate', 'Digital menu'], ['glowing_star', 'Review QR'], ['link', 'Bio links'],
      ].map((t, i) => tile(t[0], t[1], '', i, 'sm')).join('')}</div>
      <div class="a right" style="--i:3;position:relative;height:590px">
        <img class="pic framed sway" src="assets/qr-card.png" alt="" style="position:absolute;height:66%;left:0;top:0">
        <img class="pic framed sway" src="assets/qr-menu.png" alt="" style="position:absolute;height:66%;right:0;bottom:0;--i:3">
      </div>
    </div>` },

  { form: 'frame', html: `${head('3 · Software you can sell', 'A Full Shelf of <span class="g">Products</span>')}
    <div class="body">${grid(4, [
      ['glowing_star', 'MagicQR Reviews', ''], ['fork_and_knife_with_plate', 'Digital Menu', ''], ['identification_card', 'Digital Visiting Card', ''], ['link', 'Bio Links', ''],
      ['calendar', 'Appointment Booking', ''], ['desktop_computer', 'Instant Website', ''], ['speech_balloon', 'WhatsApp API CRM', ''], ['robot', 'AI Review Replies', ''],
    ], 'sm')}</div>` },

  { form: 'sides', html: `${head('4 · Training & support', 'We Walk <span class="g">With You</span>')}
    <div class="split">
      <div class="rows">
        ${row('graduation_cap', '4 to 5 live classes every month', 0)}
        ${row('speech_balloon', 'WhatsApp group for your questions', 1)}
        ${row('handshake', 'Help with your first customer', 2)}
      </div>
      <div class="a right" style="--i:3;text-align:center"><img class="pic framed sway" src="assets/whatsapp.png" alt=""></div>
    </div>` },

  { form: 'topbot', html: `${head('Included free', '<span class="g">19 Extras</span> With Every Plan')}
    <div class="body">${grid(3, [
      ['rocket', 'Dedicated launch manager', ''], ['desktop_computer', 'Your agency website', ''], ['bookmark_tabs', 'Sales & proposal kit', ''],
      ['round_pushpin', '500+ leads in your city', ''], ['books', '6 digital marketing courses', ''], ['world_map', '90-day growth blueprint', ''],
    ], 'sm')}</div>` },

  { form: 'ring', html: `${head('White label', 'Your Brand. <span class="g">Your Price.</span>')}
    <div class="body">${grid(3, [
      ['globe_with_meridians', 'Your own domain', 'Clients see your name, not ours.'],
      ['artist_palette', 'Your logo and brand', 'Every screen carries your identity.'],
      ['money_bag', 'Your pricing', 'You keep the client and the revenue.'],
    ])}<div class="a pop" style="--i:6;display:flex;justify-content:center"><span class="badge pulse">No extra cost</span></div></div>` },

  { form: 'wave', html: `${head('Timeline', 'Launch in <span class="g2">30 Days</span>')}
    <div class="body"><div class="timeline">${[
      ['Week 1', 'Setup and branding', 'gear'], ['Week 2', 'Training', 'graduation_cap'], ['Week 3', 'Outreach', 'megaphone'], ['Week 4', 'First customer', 'trophy'],
    ].map((w, i) => `<div class="tile sm a pop" style="--i:${i * 3 + 3};--c:${C[i]}"><div class="dot"></div><div class="badge3d"><span class="bob" style="--i:${i}">${ic(w[2])}</span></div><h3>${w[0]}</h3><p>${w[1]}</p></div>`).join('')}</div>
      <p class="lead a" style="--i:14;text-align:center">Our goal: your first customer within 30 days.</p></div>` },

  { form: 'frame', html: `${head('Back to our three', 'The Same Dream, <span class="g">Now Possible</span>')}
    <div class="body"><div class="grid" style="grid-template-columns:repeat(3,1fr)">
      ${person('p-rahul', 'Rahul', 'Agency owner', 'Runs an agency for local restaurants.', 0)}
      ${person('p-priya2', 'Priya', 'Works from home', 'Serves her own clients on her own time.', 1)}
      ${person('p-anil', 'Anil', 'Second income', 'Builds a side business beside his job.', 2)}
    </div></div>` },

  { form: 'corners', dark: true, html: `${head('Genuine · Registered · Recognised', 'A Partner You Can <span class="g">Trust</span>')}
    <div class="body" style="gap:30px">
      <div class="grid" style="grid-template-columns:repeat(3,1fr)">${[
        ['sports_medal', '15+ Years', 'Hands-on IT and software experience'],
        ['classical_building', 'Pvt. Ltd.', 'MagicBolt Private Limited, a registered company'],
        ['trophy', 'Award-winning', 'Honoured by national leadership and DICCI G20'],
      ].map((t, i) => tile(t[0], t[1], t[2], i, 'sm')).join('')}</div>
      <div class="grid a" style="--i:5;grid-template-columns:repeat(4,1fr)">${['startup-india-logo.png', 'meity-startup-hub.png', 'mp-startup-centre.png', 'lnct-anupam-incubation.jpg'].map((l) => `<div class="logo-card"><img src="assets/site/${l}" alt=""></div>`).join('')}</div>
      <div class="chips a" style="--i:7;justify-content:center"><span class="chip fill" style="--c:var(--orange)">${ic('newspaper')} Featured in</span>${['Dainik Bhaskar', 'Patrika', 'News18 India', 'Nai Dunia', 'DD'].map((c) => `<span class="chip">${c}</span>`).join('')}</div>
    </div>` },

  { form: 'sides', steps: 1, html: `${head('Today’s offer', 'Pick Any <span class="g">One Program</span>')}
    <div class="body"><div class="grid" style="grid-template-columns:repeat(4,1fr)">${programs.map((p, i) => `
      <div class="tile sm a pop" style="--i:${i + 2};--c:${C[i]}"><div class="badge3d"><span class="bob" style="--i:${i}">${ic(p[0])}</span></div><h3>${p[1]}</h3>
      <ul>${p[2].map((x) => `<li>${x}</li>`).join('')}</ul>
      <div class="was">Regular <s>${inr(PRICES.programRegular)}</s></div>
      <div class="now f" data-f="1">${inr(PRICES.programOffer)}<small>for the first year</small></div></div>`).join('')}</div></div>` },

  { form: 'burst', dark: true, cls: 'mid', steps: 2, html: `${head('Complete package', 'All Four Programs <span class="g">Together</span>')}
    <div class="body center" style="gap:14px">
      <div class="chips tight a" style="--i:2">${programs.map((p, i) => `<span class="chip" style="--c:${C[i]}">${ic(p[0])} ${p[1]}</span>`).join('')}</div>
      <div class="was a" style="--i:4;font-size:52px">Regular <s>${inr(PRICES.bundleRegular)}</s></div>
      <div class="mega f" data-f="1"><span class="g shine">₹<span data-count="${PRICES.bundleOffer}">0</span></span></div>
      <div class="f" data-f="2"><span class="badge pulse">You save ${inr(PRICES.bundleRegular - PRICES.bundleOffer)} · first year</span></div>
    </div>` },

  { form: 'ring', steps: 1, html: `${head('Only for today’s bookings', 'Free <span class="g">Starter Kit</span>')}
    <div class="split">
      <div class="rows">
        ${row('identification_card', '20 NFC cards', 0)}
        ${row('placard', '20 MagicQR standees', 1)}
        ${row('backpack', 'Agency kit bag', 2)}
        <div class="f" data-f="1"><span class="badge pulse">Book today to claim it</span></div>
      </div>
      <div class="a right" style="--i:3;display:grid;place-items:center"><img class="pic sway" src="assets/standee.webp" alt="" style="max-height:640px"></div>
    </div>` },

  { form: 'burst', cls: 'mid', bolt: [0.82, 0.3, 1.2], html: `
    <div class="body center" style="gap:34px">
      ${logoAnim(900)}
      <h1 class="xl" style="margin-top:20px">Book Your Seat <span class="g">Today</span></h1>
      <div class="chips a" style="--i:8">
        <span class="chip" style="--c:var(--blue)">${ic('globe_with_meridians')} ${CONTACT.web}</span>
        <span class="chip" style="--c:var(--orange)">${ic('email')} ${CONTACT.email}</span>
        <span class="chip" style="--c:var(--green)">${ic('phone')} ${CONTACT.phones}</span>
      </div>
      <p class="lead a" style="--i:10">Choose your program, message us, and launch in 30 days.</p>
    </div>` },
];
