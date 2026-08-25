// Sample data for standalone/preview mode.
// In production, form submission data flows to the MCP tool; the confirmation
// result comes back via bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Dacia Bigster', description: 'Family SUV with generous space, hybrid and Eco-G engines.', price: 'de la 20.490 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/oveview/dacia-bigster-db3l1-ph1-055-mobile.jpg.ximg.xsmall.jpg/4b67d90d3c.jpg' },
  { name: 'Dacia Duster', description: 'Versatile compact SUV built for city and off-road driving.', price: 'de la 17.100 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/overview/editorial/dacia-duster-p1310-overview-004-1-mobile.jpg.ximg.xsmall.jpg/ba4175c768.jpg' },
  { name: 'Dacia Jogger', description: 'Family car with 5 or 7 seats and hybrid technology.', price: 'de la 16.650 EUR', category: 'Family', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/rji/jogger-ri1-ph2/herozone-banners/jogger-ri1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/5224fc9270.jpg' },
  { name: 'Dacia Sandero Stepway', description: 'Crossover with factory-fitted LPG, up to 120 HP and automatic transmission.', price: 'de la 13.741 EUR', category: 'Crossover', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero-stepway/sandero-stepway-bi1-ph2/herozone-banners/sandero-stepway-bi1-ph2-herozone-background-desktop-001.jpg.ximg.large.jpg/48eb89e802.jpg' },
  { name: 'Dacia Spring', description: '100% electric city car with 4 seats and up to 315 km urban range.', price: 'de la 13.590 EUR', category: 'Electric', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-s2e-ph2-my26/overview/editorial/dacia-spring-s2e-ph2-overview-003.jpg.ximg.xsmall.jpg/5e53676620.jpg' },
  { name: 'Noul Logan', description: 'The most powerful Logan yet, a spacious sedan with 120 HP LPG engine.', price: 'de la 12.741 EUR', category: 'Sedan', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg' },
];

// Brand palette from the action payload.
const PALETTE = ['#646b52', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i += 1) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#2563eb';

const FIELDS = [
  { name: 'model', label: 'Model', placeholder: 'Dacia model to test drive.', type: 'select', required: true },
  { name: 'full_name', label: 'Full Name', placeholder: 'Customer full name.', type: 'text', required: true },
  { name: 'email', label: 'Email', placeholder: 'Customer email address.', type: 'email', required: true },
  { name: 'phone', label: 'Phone', placeholder: 'Customer phone number.', type: 'tel', required: true },
  { name: 'preferred_date', label: 'Preferred Date', placeholder: 'Preferred date for the test drive.', type: 'date', required: false },
];

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let models = SAMPLE_DATA;
  let result = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      result = _result?.structuredContent || {};
    }
  }

  block.textContent = '';
  renderForm(block, models, result, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderForm(block, models, result, bridge) {
  const card = document.createElement('div');
  card.className = 'book-test-drive-card';

  const hero = models.find((m) => m.name === 'Dacia Bigster') || models[0];

  const imageWrap = document.createElement('div');
  imageWrap.className = 'book-test-drive-hero';
  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (hero && hero.image_url) {
    const img = document.createElement('img');
    img.src = hero.image_url;
    img.alt = hero.name || 'Dacia model';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  const header = document.createElement('div');
  header.className = 'book-test-drive-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;
  const title = document.createElement('h3');
  title.className = 'book-test-drive-title';
  title.textContent = 'Book a Test Drive';
  header.appendChild(title);
  const sub = document.createElement('p');
  sub.className = 'book-test-drive-desc';
  sub.textContent = 'Choose a model and share your details to arrange a test drive at a dealer near you.';
  header.appendChild(sub);
  card.appendChild(header);

  // Confirmation state (production, after tool returns)
  if (result && (result.confirmation_id || result.status || result.message)) {
    const conf = document.createElement('div');
    conf.className = 'book-test-drive-confirm';
    const status = document.createElement('div');
    status.className = 'book-test-drive-status';
    status.textContent = result.status || 'Confirmed';
    conf.appendChild(status);
    const msg = document.createElement('p');
    msg.className = 'book-test-drive-message';
    msg.textContent = result.message || 'Your test drive request has been received.';
    conf.appendChild(msg);
    if (result.confirmation_id) {
      const cid = document.createElement('p');
      cid.className = 'book-test-drive-cid';
      cid.textContent = `Confirmation: ${result.confirmation_id}`;
      conf.appendChild(cid);
    }
    card.appendChild(conf);
    block.appendChild(card);
    return;
  }

  const form = document.createElement('form');
  form.className = 'book-test-drive-form';

  const inputs = {};
  FIELDS.forEach((f) => {
    const field = document.createElement('label');
    field.className = 'book-test-drive-field';
    const lbl = document.createElement('span');
    lbl.className = 'book-test-drive-label';
    lbl.textContent = f.required ? `${f.label} *` : f.label;
    field.appendChild(lbl);

    let input;
    if (f.type === 'select') {
      input = document.createElement('select');
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = 'Select a model';
      ph.disabled = true;
      ph.selected = true;
      input.appendChild(ph);
      models.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        if (m.name === 'Dacia Bigster') { opt.selected = true; ph.selected = false; }
        input.appendChild(opt);
      });
    } else {
      input = document.createElement('input');
      input.type = f.type;
      input.placeholder = f.placeholder;
    }
    input.className = 'book-test-drive-input';
    input.name = f.name;
    if (f.required) input.required = true;
    inputs[f.name] = input;
    field.appendChild(input);
    form.appendChild(field);
  });

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'book-test-drive-cta';
  btn.textContent = 'Book Test Drive';
  form.appendChild(btn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    Object.keys(inputs).forEach((k) => { values[k] = inputs[k].value; });
    if (bridge) {
      bridge.callTool('book_test_drive', values);
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}
