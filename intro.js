/* =============================================================
   Excelsior Consultancy · startup-logo intro
   Liquid-metal-style reveal of the brand mark on first visit.
   Plays once per session (sessionStorage flag), skippable with
   click or Esc, respects prefers-reduced-motion.

   LOGO SWAP · when you drop your final logo into /logo/, set
   the LOGO_SRC constant below to its path. The intro switches
   automatically to render your image with the liquid-metal
   filter applied. Until LOGO_SRC is set, the brand A-glyph is
   used as the placeholder.
   ============================================================= */
(function intro() {
  // ===== Configurable =====
  var LOGO_SRC      = 'logo/excelsior-loader-transparent.png'; // E-mark with arrow, transparent bg
  var WORDMARK_HTML = 'Excelsior <span class="gold">Consultancy</span>';
  var ONCE_PER_SESSION = false;      // false = play on every page load (set true for production)
  var TOTAL_DURATION_MS = 3400;      // total ms before overlay removed

  // ===== Guards =====
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var seen = false;
  if (ONCE_PER_SESSION) {
    try { seen = sessionStorage.getItem('xc_intro_seen') === '1'; } catch (_) {}
  }
  if (seen || reduceMotion) return;
  try { sessionStorage.setItem('xc_intro_seen', '1'); } catch (_) {}

  // ===== Build overlay (DOM API, no innerHTML on untrusted strings) =====
  document.body.classList.add('intro-active');

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var XLINK = 'http://www.w3.org/1999/xlink';

  var overlay = document.createElement('div');
  overlay.className = 'intro-overlay';
  overlay.id = 'introOverlay';
  overlay.setAttribute('role', 'presentation');
  overlay.setAttribute('aria-hidden', 'true');

  // SVG root
  var svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'intro-logo');
  svg.setAttribute('viewBox', '0 0 200 200');

  // <defs> · liquid-metal filter + gold gradient
  var defs = document.createElementNS(SVG_NS, 'defs');

  // Filter
  var filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', 'liquidMetal');
  filter.setAttribute('x', '-30%');
  filter.setAttribute('y', '-30%');
  filter.setAttribute('width', '160%');
  filter.setAttribute('height', '160%');

  var turb = document.createElementNS(SVG_NS, 'feTurbulence');
  turb.setAttribute('type', 'fractalNoise');
  turb.setAttribute('baseFrequency', '0.04');
  turb.setAttribute('numOctaves', '3');
  turb.setAttribute('seed', '3');
  turb.setAttribute('result', 'turb');
  var turbAnim = document.createElementNS(SVG_NS, 'animate');
  turbAnim.setAttribute('attributeName', 'baseFrequency');
  turbAnim.setAttribute('dur', '2.4s');
  turbAnim.setAttribute('values', '0.08;0.04;0.015;0.01');
  turbAnim.setAttribute('keyTimes', '0;0.4;0.8;1');
  turbAnim.setAttribute('fill', 'freeze');
  turb.appendChild(turbAnim);
  filter.appendChild(turb);

  var disp = document.createElementNS(SVG_NS, 'feDisplacementMap');
  disp.setAttribute('in', 'SourceGraphic');
  disp.setAttribute('in2', 'turb');
  disp.setAttribute('scale', '80');
  var dispAnim = document.createElementNS(SVG_NS, 'animate');
  dispAnim.setAttribute('attributeName', 'scale');
  dispAnim.setAttribute('dur', '2.4s');
  dispAnim.setAttribute('values', '100;55;15;0');
  dispAnim.setAttribute('keyTimes', '0;0.4;0.8;1');
  dispAnim.setAttribute('fill', 'freeze');
  disp.appendChild(dispAnim);
  filter.appendChild(disp);
  defs.appendChild(filter);

  // Gradient
  var grad = document.createElementNS(SVG_NS, 'linearGradient');
  grad.setAttribute('id', 'metalGradient');
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
  var stops = [
    ['0%',   '#8E7227'],
    ['45%',  '#C9A45E'],
    ['60%',  '#F5EFE3'],
    ['100%', '#8E7227'],
  ];
  for (var i = 0; i < stops.length; i++) {
    var s = document.createElementNS(SVG_NS, 'stop');
    s.setAttribute('offset', stops[i][0]);
    s.setAttribute('stop-color', stops[i][1]);
    grad.appendChild(s);
  }
  defs.appendChild(grad);
  svg.appendChild(defs);

  // Logo group with the liquid-metal filter applied
  var g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('filter', 'url(#liquidMetal)');

  if (LOGO_SRC) {
    // Render the user's logo as an <image>
    var img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS(XLINK, 'href', LOGO_SRC);
    img.setAttribute('href', LOGO_SRC);
    img.setAttribute('x', '20'); img.setAttribute('y', '20');
    img.setAttribute('width', '160'); img.setAttribute('height', '160');
    img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    g.appendChild(img);
  } else {
    // Placeholder · brand A-glyph
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M40 165 L100 30 L160 165 M137 110 L160 165 L120 145');
    path.setAttribute('fill', 'url(#metalGradient)');
    path.setAttribute('stroke', '#C9A45E');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    g.appendChild(path);
  }
  svg.appendChild(g);
  overlay.appendChild(svg);

  // Liquid-metal sheen overlay
  var sheen = document.createElement('div');
  sheen.className = 'intro-sheen';
  sheen.setAttribute('aria-hidden', 'true');
  overlay.appendChild(sheen);

  // Wordmark · plain text so no innerHTML risk
  var wm = document.createElement('div');
  wm.className = 'intro-wordmark';
  var wmText = document.createElement('span');
  wmText.appendChild(document.createTextNode('Excelsior '));
  var wmGold = document.createElement('span');
  wmGold.className = 'gold';
  wmGold.appendChild(document.createTextNode('Consultancy'));
  wm.appendChild(wmText);
  wm.appendChild(wmGold);
  overlay.appendChild(wm);

  // Skip hint
  var skip = document.createElement('div');
  skip.className = 'intro-skip';
  skip.appendChild(document.createTextNode('Click or press Esc to skip'));
  overlay.appendChild(skip);

  // Mount as first child so it covers everything
  if (document.body.firstChild) {
    document.body.insertBefore(overlay, document.body.firstChild);
  } else {
    document.body.appendChild(overlay);
  }

  // ===== Dismissal =====
  function dismiss() {
    if (overlay.classList.contains('done')) return;
    overlay.classList.add('done');
    document.body.classList.remove('intro-active');
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') dismiss(); }
  overlay.addEventListener('click', dismiss);
  document.addEventListener('keydown', onKey);
  setTimeout(dismiss, TOTAL_DURATION_MS);
})();
