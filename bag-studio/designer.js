/* Design your bag — bottom gusset bread bag (preview). Plain JS, no build step. */
(() => {
'use strict';
const M = globalThis.MetroProof, C = globalThis.MetroCreative;
Object.assign(M.SHAPES,C.marks);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NS = 'http://www.w3.org/2000/svg';
const U = 100;              // svg units per inch
const IN = 25.4;
const SEAL = 0.375;         // side seal, each side (no print)
const TRIM = 1.0;           // top trim / opening lip (no print)
const SAFE = 0.25;          // safety margin inside seals, trim and fold
const MAX_INKS = 8;
const SIZES = [{ w: 6, g: 3, l: 15 }, { w: 7, g: 3.5, l: 16 }, { w: 8, g: 4, l: 18 }, { w: 9, g: 4, l: 20 }, { w: 10, g: 5, l: 24 }];
const LIM = { w: [4, 14], g: [2, 8], l: [10, 30] };
const FONTS = [
  { id: 'Josefin Sans', label: 'Clean', wt: 700 },
  { id: 'Montserrat', label: 'Bold', wt: 800 },
  { id: 'Playfair Display', label: 'Classic', wt: 700 },
  { id: 'Pacifico', label: 'Script', wt: 400 },
  { id: 'Bebas Neue', label: 'Tall', wt: 400 },
  { id: 'Fredoka', label: 'Friendly', wt: 600 },
  { id: 'Inter', label: 'Modern', wt: 700 },
  { id: 'Oswald', label: 'Condensed', wt: 600 },
  { id: 'Lora', label: 'Editorial', wt: 700 },
  { id: 'DM Sans', label: 'Readable', wt: 600 },
  { id: 'Courier New', label: 'Typewriter', wt: 700 },
];
const SUGGEST = ['#1d1d1f', '#ffffff', '#c8102e', '#0b5fa5', '#1e7b34', '#6b3e1e', '#f2c200', '#F0810A'];
const CHECK = [
  { k: 'nutrition', t: 'Nutrition Facts panel', d: 'Usually on the back.', panel: 'back' },
  { k: 'ingredients', t: 'Ingredients', d: 'Listed from most to least.', panel: 'back', text: 'INGREDIENTS: [list them here, most to least]' },
  { k: 'allergens', t: 'Allergens', d: 'For example "Contains: Wheat".', panel: 'back', text: 'CONTAINS: [allergens]' },
  { k: 'netwt', t: 'Net weight', d: 'Usually on the front, near the bottom.', panel: 'front', text: 'NET WT [00] OZ ([000] g)' },
  { k: 'maker', t: "Maker's name & address", d: 'Who made or packed it: city, state, ZIP.', panel: 'back', text: 'Made by [Company name]\n[Street], [City], [ST] [ZIP]' },
];
const fmt = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s.replace(/\.5$/, '½').replace(/\.25$/, '¼').replace(/\.75$/, '¾').replace(/^0(?=[½¼¾])/, ''); };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- state ---------- */
const WICKET_SIZES = [{w:7,g:3.5,l:16},{w:8,g:4,l:18},{w:9,g:4,l:20},{w:10,g:5,l:24}];
const WICKET_LIP=2, PANEL_GAP=.65;
const example = new URLSearchParams(location.search).get('example')==='late-riser';
const draftKey = example ? 'metro-dyb-late-riser-review-1' : 'metro-dyb-1';
const S = { type:'bread', starter:null, size: { ...SIZES[2] }, film: 'clear', bg: null, els: [], manual: {}, declared: '' };
const IMGS = {};            // id -> { src: canvas, ko: canvas, url, koUrl, name, colors, koColors }
let sel = null, view = 'front', guides = false;
const hist = [], fut = [];
const snap = () => JSON.stringify({ type:S.type, starter:S.starter, size: S.size, film: S.film, bg: S.bg, els: S.els, manual: S.manual, declared: S.declared });
let last = snap();
function commit() { const s = snap(); if (s === last) return; hist.push(last); if (hist.length > 80) hist.shift(); fut.length = 0; last = s; syncUndo(); save(); }
function restore(s) { const o = JSON.parse(s); Object.assign(S, o); last = s; if (sel && !S.els.find((e) => e.id === sel)) sel = null; syncAll(); save(); }
function undo() { if (!hist.length) return; fut.push(last); restore(hist.pop()); syncUndo(); }
function redo() { if (!fut.length) return; hist.push(last); restore(fut.pop()); syncUndo(); }
function syncUndo() { $('#undoBtn').disabled = !hist.length; $('#redoBtn').disabled = !fut.length; }

/* ---------- geometry ---------- */
const W = () => S.size.w, L = () => S.size.l, G = () => S.size.g;
const wicket = () => S.type === 'wicket';
const bagName = () => wicket() ? 'Wicketed bag' : 'Bottom gusset bread bag';
const sizesFor = () => wicket() ? WICKET_SIZES : SIZES;
const backBody = () => L()+PANEL_GAP+WICKET_LIP;
const holeOffset = () => (W()>=8?5:W()*.55)/2;
const shapeName = e => (M.SHAPES[e.shape]||M.SHAPES.rectangle)[0];
// the loaf face the 3D mockup prints on (same formulas as the mockup's bread bag), inches from the bag bottom
function face() {
  const w = W() * IN, h = L() * IN, g = G() * IN;
  const A = w / 2 - 0.1 * g, B = g / 2 * 1.22, Hl = h * 0.57, re = Math.min(B * 0.7, 40), hb = Math.min(g * 0.42, Hl * 0.18), y0 = Hl - re;
  const half = (A - 8) / IN;
  return { x0: W() / 2 - half, x1: W() / 2 + half, yb0: (hb * 0.7 + 6) / IN, yb1: (y0 + re * 0.25) / IN };
}
// zones in panel coordinates (inches, from the panel's top-left, panel upright, opening at the top)
function zones() {
  if(wicket())return {twist:0,safe:{x0:SEAL+SAFE,x1:W()-SEAL-SAFE,y0:TRIM+SAFE,y1:L()-SAFE}};
  const f = face();
  const twist = clamp(L() - f.yb1, TRIM + 0.5, L() * 0.7);
  return { twist, safe: { x0: SEAL + SAFE, x1: W() - SEAL - SAFE, y0: TRIM + SAFE, y1: L() - SAFE } };
}
const measCtx = document.createElement('canvas').getContext('2d');
const fontOf = (e) => FONTS.find((f) => f.id === e.font) || FONTS[0];
function textBox(e) {
  const f = fontOf(e); const px = e.size * U; measCtx.font = `${f.wt} ${px}px "${f.id}"`;
  const lines = String(e.text || ' ').split('\n'), ls = e.size * U * (e.letter||0)/100, lead=e.lead||118;
  if ('letterSpacing' in measCtx) measCtx.letterSpacing=`${ls}px`;
  const wmax = Math.max(...lines.map((t) => measCtx.measureText(t || ' ').width + ('letterSpacing' in measCtx?0:Math.max(0,[...t].length-1)*ls)));
  return { w: Math.max(wmax / U, e.size * 0.6), h: lines.length * e.size * lead/100, lines };
}
function dims(e) { if (e.type === 'text') { const b = textBox(e); return { w: b.w, h: b.h }; } return { w: e.w, h: e.h }; }
function corners(e) {
  const { w, h } = dims(e); const r = e.rot * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [e.x + x * c - y * s, e.y + x * s + y * c]);
}
function bbox(e) { const p = corners(e); const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; }
const ELNAME = (e) => e.kind ? (CHECK.find((c) => c.k === e.kind) || {}).t || 'Label' : e.type === 'barcode' ? 'Barcode' : e.type === 'shape' ? (M.SHAPES[e.shape]||M.SHAPES.rectangle)[0] : e.type === 'image' ? 'Logo' : e.type === 'text' ? `“${String(e.text).split('\n')[0].slice(0, 18)}”` : 'Color band';
function issues(e) {
  const b = bbox(e), z = zones(), sf = z.safe, eps = 0.005, out = [];
  if (e.type === 'band' && !wicket()) { // a band may run edge to edge: the press bleeds it into the seals, so only flag it if it covers the top trim
    if (b.y0 < TRIM - eps) out.push({ lvl: 'no', where: 'the top trim / opening' });
    else if (b.y0 < z.twist) out.push({ lvl: 'care', where: 'the twist-tie area (it gathers there)' });
    return out;
  }
  const where = [];
  if (b.x0 < sf.x0 - eps || b.x1 > sf.x1 + eps) where.push('the side seal');
  if (b.y0 < sf.y0 - eps) where.push('the top trim / opening');
  if (b.y1 > sf.y1 + eps) where.push(b.y1 > L() ? 'the bottom gusset fold' : 'the bottom fold');
  if (where.length) out.push({ lvl: 'no', where: where.join(' and ') });
  else if (b.y0 < z.twist - eps) out.push({ lvl: 'care', where: 'the twist-tie area (it gathers and wrinkles there)' });
  return out;
}

/* ---------- elements ---------- */
function addEl(e) { e.id = uid(); e.rot = e.rot || 0; S.els.push(e); sel = e.id; syncAll(); commit(); }
function curEl() { return S.els.find((e) => e.id === sel) || null; }
function defaultPanel() { return view === 'back' ? 'back' : 'front'; }
function placeY(h) { const z = zones(); return clamp(z.twist + (L() - SAFE - z.twist) * 0.42, z.twist + h / 2 + 0.1, L() - SAFE - h / 2 - 0.05); }
function freeY(panel, h) { // below what is already on this side if it fits, else above it, else the middle of the loaf area
  const z = zones(), others = S.els.filter((q) => q.panel === panel && q.type !== 'band');
  if (!others.length) return placeY(h);
  const lo = Math.max(...others.map((q) => bbox(q).y1)), hi = Math.min(...others.map((q) => bbox(q).y0));
  if (lo + 0.2 + h <= L() - SAFE) return lo + 0.15 + h / 2;
  if (hi - 0.2 - h >= z.twist) return hi - 0.15 - h / 2;
  return placeY(h);
}
function fitWidth(e) { const maxW = W() - 2 * (SEAL + SAFE) - 0.2; const b = textBox(e); if (b.w > maxW) e.size *= maxW / b.w; }
function addText(txt, opt = {}) {
  const panel = opt.panel || defaultPanel();
  const e = { type: 'text', text: txt, font: opt.font || 'Josefin Sans', color: opt.color || '#1d1d1f', size: opt.size || Math.max(0.45, Math.min(1.1, W() * 0.11)), panel, x: W() / 2, y: 0, kind: opt.kind };
  const b = textBox(e); const maxW = W() - 2 * (SEAL + SAFE) - 0.3;
  if (b.w > maxW) e.size *= maxW / b.w;
  e.y = opt.y != null ? opt.y : freeY(panel, textBox(e).h);
  if (view === 'whole' && !opt.stay) setView(panel);
  addEl(e);
}
function addBand() {
  const panel = defaultPanel(); const h = Math.min(1.5, L() * 0.08);
  addEl({ type: 'band', color: S.bg && S.bg !== '#F0810A' ? '#F0810A' : '#c8102e', panel, x: W() / 2, y: TRIM + (zones().twist - TRIM) * .49, w: W(), h });
  if (view === 'whole') setView(panel);
}
function addShape(shape) {
  if (!M.SHAPES[shape]) return; const panel=defaultPanel(), w=Math.min(W()*0.36,2.5), h=shape==='line'?.4:shape==='arrow'?w*.62:w*.85;
  if (view==='whole') setView(panel);
  addEl({type:'shape',shape,panel,x:W()/2,y:freeY(panel,h),w,h,color:'#F0810A'});
}
function addPlaceholder(item) {
  const z = zones(), sf = z.safe, maxW = sf.x1 - sf.x0;
  if (item.k === 'nutrition') {
    let w = Math.min(2.4, maxW * 0.55), h = w * 1.7; const room = L() - SAFE - z.twist - 0.2; if (h > room) { h = room; w = h / 1.7; }
    addEl({ type: 'nf', kind: 'nutrition', panel: 'back', nf: {}, w, h, x: sf.x1 - w / 2 - 0.1, y: L() - SAFE - h / 2 - 0.1 });
  } else {
    const nf = S.els.find((e) => e.kind === 'nutrition' && e.panel === item.panel);
    const sizes = { ingredients: 0.16, allergens: 0.18, maker: 0.15, netwt: 0.22 };
    const order = { ingredients: 0, allergens: 1, maker: 2 };
    let y; if (item.panel === 'back') y = z.twist + 0.5 + (order[item.k] || 0) * 0.75; else y = L() - SAFE - 0.45;
    const opt = { panel: item.panel, kind: item.k, size: sizes[item.k], y, stay: true };
    addText(item.text, opt);
    const e = curEl(); const b = textBox(e);
    if (nf && item.panel === 'back') { const room = (nf.x - nf.w / 2) - sf.x0 - 0.15; if (b.w > room) e.size *= room / b.w; e.x = sf.x0 + textBox(e).w / 2 + 0.05; }
    else if (b.w > maxW - 0.2) { e.size *= (maxW - 0.2) / b.w; }
    syncAll(); commit();
  }
  if (view !== item.panel) setView(item.panel);
  if (item.k==='nutrition') openLabel(curEl());
}
function fixEl(e) {
  const z = zones(), sf = z.safe;
  if (e.type === 'band' && !wicket()) { const b = bbox(e); if (b.y0 < TRIM) e.y += TRIM - b.y0 + 0.05; return; }
  let b = bbox(e); const bw = b.x1 - b.x0, bh = b.y1 - b.y0;
  const top = (L() - SAFE - z.twist) > bh + 0.1 ? Math.max(z.twist,sf.y0) : sf.y0;
  const k = Math.min(1, (sf.x1 - sf.x0 - 0.1) / bw, (sf.y1 - top - 0.1) / bh);
  if (k < 1) { if (e.type === 'text') e.size *= k; else { e.w *= k; e.h *= k; } }
  b = bbox(e);
  if (b.x0 < sf.x0) e.x += sf.x0 - b.x0 + 0.03; if (b.x1 > sf.x1) e.x -= b.x1 - sf.x1 + 0.03;
  if (b.y0 < top) e.y += top - b.y0 + 0.03; if (b.y1 > sf.y1) e.y -= b.y1 - sf.y1 + 0.03;
}

/* ---------- images ---------- */
function loadFile(f) {
  if (!f) return;
  if (!/^image\/(png|jpe?g|svg\+xml)$/.test(f.type) && !/\.(png|jpe?g|svg)$/i.test(f.name)) { toast('Please use a PNG, JPG or SVG file'); return; }
  if (f.size > 25 * 1024 * 1024) { toast('That file is over 25 MB. Try a smaller one.'); return; }
  const url = URL.createObjectURL(f); const img = new Image();
  img.onload = () => {
    let w = img.naturalWidth || 1000, h = img.naturalHeight || 1000;
    const isSvg = /svg/.test(f.type) || /\.svg$/i.test(f.name);
    const k = Math.min(isSvg ? 3 : 1, 1600 / Math.max(w, h)); w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const id = uid(); registerImage(id, c, f.name);
    const rec = IMGS[id]; const whiteCorners = rec.whiteBg;
    const z = zones(), sf = z.safe; const maxW = (sf.x1 - sf.x0) * 0.8, maxH = (L() - SAFE - z.twist) * 0.55;
    let ew = maxW, eh = ew * h / w; if (eh > maxH) { eh = maxH; ew = eh * w / h; }
    const panel = defaultPanel();
    if (view === 'whole') setView(panel);
    addEl({ type: 'image', img: id, ko: whiteCorners, panel, x: W() / 2, y: z.twist + (L() - SAFE - z.twist) * 0.4, w: ew, h: eh });
    toast(whiteCorners ? 'Logo added. We removed its white background.' : 'Logo added. Drag it where you want it.');
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast("Couldn't read that image. Try a PNG or JPG."); };
  img.src = url;
}
function registerImage(id, c, name) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const px = (x, y) => { const i = (y * c.width + x) * 4; return d[i + 3] > 200 && d[i] > 236 && d[i + 1] > 236 && d[i + 2] > 236; };
  const whiteBg = [[0, 0], [c.width - 1, 0], [0, c.height - 1], [c.width - 1, c.height - 1]].filter(([x, y]) => px(x, y)).length >= 3;
  const ko = document.createElement('canvas'); ko.width = c.width; ko.height = c.height; const kx = ko.getContext('2d');
  const id2 = kx.createImageData(c.width, c.height); const o = id2.data;
  for (let i = 0; i < d.length; i += 4) { const m = Math.min(d[i], d[i + 1], d[i + 2]); o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = m > 242 ? 0 : (m > 225 ? d[i + 3] * (242 - m) / 17 : d[i + 3]); }
  kx.putImageData(id2, 0, 0);
  const rec = IMGS[id] = { src: c, ko, name, whiteBg, url: c.toDataURL('image/png') };
  rec.href = rec.url; rec.koHref = ko.toDataURL('image/png');
  c.toBlob((b) => { if (b) { rec.href = URL.createObjectURL(b); queue(); } }); ko.toBlob((b) => { if (b) { rec.koHref = URL.createObjectURL(b); queue(); } });
}
function inks() { return M.inkPlan(S).items; }

/* ---------- rendering the dieline (svg) ---------- */
const svg = $('#stage');
let K = 1; // screen px per svg unit
let zoom = false;
function region() { // the part of the dieline the stage shows, in inches
  if (view === 'whole') return { y0: 0, y1: wicket()?backBody()+L():2 * L() + G() };
  if(wicket())return {y0:!zoom&&view==='back'?-WICKET_LIP:0,y1:L()};
  if (zoom) return { y0: Math.max(0, zones().twist - 1.2), y1: L() };
  return { y0: 0, y1: L() };
}
function layout() {
  const box = $('#stageBox'); const cw = box.clientWidth, ch = box.clientHeight;
  const r = region(); const w = W() * U, h = (r.y1 - r.y0) * U;
  const padL = 42, padR = view === 'whole' && guides && cw > 470 ? Math.min(170, cw * .39) : 33, padT = 33, padB = 34;
  K = Math.max(0.03, Math.min((cw - padL - padR) / w, (ch - padT - padB) / h));
  const vw = cw / K, vh = ch / K;
  const ox = -(padL / K) - ((cw - padL - padR) / K - w) / (view === 'whole' && guides && cw > 470 ? 3 : 2), oy = r.y0 * U - (padT / K) - ((ch - padT - padB) / K - h) / 2;
  svg.setAttribute('viewBox', `${ox} ${oy} ${vw} ${vh}`);
}
const px = (n) => n / K; // screen px -> svg units
function panelSvg(panel, rotated) {
  const w = W() * U, h = L() * U, z = zones(), sf = z.safe;
  const film = S.bg || (S.film === 'white' ? '#ffffff' : '#fafbfc');
  let s = `<g id="p-${panel}" data-panel="${panel}"${rotated?(wicket()?` transform="translate(0 ${backBody()*U})"`:` transform="translate(0 ${(L() + G()) * U}) rotate(180 ${w / 2} ${h / 2})"`):''}>`;
  if(wicket()&&panel==='back'){
   s+=`<g pointer-events="none"><rect x="0" y="${-WICKET_LIP*U}" width="${w}" height="${WICKET_LIP*U}" fill="#f2f3f6" stroke="#77777f" stroke-width="${px(1)}"/><path d="M0 ${-U*.235}h${w}" fill="none" stroke="#77777f" stroke-dasharray="${px(3)} ${px(2)}" stroke-width="${px(1)}"/>${[-1,1].map(d=>`<circle cx="${w/2+d*holeOffset()*U}" cy="${-1.1*U}" r="${.236*U}" fill="white" stroke="#77777f" stroke-width="${px(1)}"/>`).join('')}</g>`;
  }
  s += `<rect x="0" y="0" width="${w}" height="${h}" fill="${film}"${S.film === 'clear' && !S.bg ? ' fill-opacity=".85"' : ''}/>`;
  s += `<clipPath id="clip-${panel}"><rect x="0" y="0" width="${w}" height="${h}"/></clipPath><g clip-path="url(#clip-${panel})">`;
  for (const e of S.els.filter((q) => q.panel === panel)) s += elSvg(e);
  s += `</g>`;
  // Show print zones when the guide overlay is requested.
  if (guides) {
  if(!wicket())s += `<rect x="0" y="${TRIM * U}" width="${w}" height="${(z.twist - TRIM) * U}" fill="url(#hCare)" pointer-events="none"/>`;
  s += `<rect x="0" y="0" width="${w}" height="${TRIM * U}" fill="url(#hNo)" pointer-events="none"/>`;
  s += `<rect x="0" y="${TRIM * U}" width="${SEAL * U}" height="${h - TRIM * U}" fill="url(#hNo)" pointer-events="none"/><rect x="${w - SEAL * U}" y="${TRIM * U}" width="${SEAL * U}" height="${h - TRIM * U}" fill="url(#hNo)" pointer-events="none"/>`;
  s += `<rect x="${sf.x0 * U}" y="${sf.y0 * U}" width="${(sf.x1 - sf.x0) * U}" height="${(sf.y1 - sf.y0) * U}" fill="none" stroke="#1f9d55" stroke-width="${px(2)}" stroke-dasharray="${px(7)} ${px(5)}" pointer-events="none"/>`;
  if(!wicket())s += `<line x1="0" y1="${z.twist * U}" x2="${w}" y2="${z.twist * U}" stroke="#b58800" stroke-width="${px(1.5)}" stroke-dasharray="${px(3)} ${px(3)}" pointer-events="none"/>`;
  s += `<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#1d1d1f" stroke-width="${px(1.5)}" pointer-events="none"/>`;
  // labels (kept upright on screen)
  const fs = px(view === 'whole' ? 10.5 : 12.5), lab = (x, y, t, col, anchor = 'middle', bold = false) => {
    const tr = rotated && !wicket() ? ` transform="rotate(180 ${x} ${y})"` : '';
    return `<text x="${x}" y="${y}" font-size="${fs}" fill="${col}" text-anchor="${anchor}" dominant-baseline="middle" font-weight="${bold ? 700 : 600}" pointer-events="none"${tr} style="paint-order:stroke" stroke="rgba(255,255,255,.85)" stroke-width="${px(3)}">${esc(t)}</text>`;
  };
  const roomy = W() * U * K > 200;
  if (view !== 'whole' && W() * U * K > 110) {
    s += `<g opacity="${S.els.some((q) => q.panel === panel) ? 0.5 : 1}">`;
  s += lab(w / 2, TRIM * U / 2, roomy ? 'Top trim & opening: no print' : 'Trim: no print', '#a1271c');
  if(!wicket())s += lab(w / 2, (TRIM + (z.twist - TRIM) / 2) * U - px(8), roomy ? 'Twist-tie area: it gathers here' : 'Twist-tie area', '#6b5000');
  if(!wicket())s += lab(w / 2, (TRIM + (z.twist - TRIM) / 2) * U + px(8), roomy ? 'keep logo & words below the line' : 'keep logo below', '#6b5000');
  s += lab(w / 2, (Math.max(z.twist,sf.y0) + 0.05) * U + px(12), 'Safe print area', '#11602f', 'middle', true);
  if (view !== 'whole' && L() * U * K > 300) { const sy = (L() * 0.78) * U; s += `<text x="${SEAL * U / 2}" y="${sy}" font-size="${px(10.5)}" fill="#a1271c" text-anchor="middle" font-weight="600" transform="rotate(-90 ${SEAL * U / 2} ${sy})" pointer-events="none">Side seal</text>`; }
    s += '</g>';
  }
  if (view === 'whole') s += lab(w / 2, (wicket()?TRIM*.55:(TRIM + (zones().twist - TRIM) / 2))*U, panel === 'front' ? 'FRONT' : 'BACK', '#1d1d1f', 'middle', true);
  } else { s += `<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#77777f" stroke-width="${px(1.1)}" pointer-events="none"/>`; }
  // selection
  const e = curEl();
  const smart = drag?.e.panel===panel ? drag.guides||[] : [];
  for (const g of smart) {
    const isLayer=g.kind!=='bag', max=g.axis==='x'?h:w, pad=isLayer?px(7):0, at=g.value*U, a=Math.max(0,g.from*U-pad), b=Math.min(max,g.to*U+pad);
    const t=g.axis==='x'?`x1="${at}" x2="${at}" y1="${a}" y2="${b}"`:`x1="${a}" x2="${b}" y1="${at}" y2="${at}"`;
    s += `<line ${t} stroke="#fff" stroke-opacity=".95" stroke-width="${px(4.5)}" pointer-events="none"/><line class="snap-guide" data-snap-axis="${g.axis}" data-snap-kind="${g.kind}" ${t} stroke="${isLayer?'#8a27ba':'#1573e6'}" stroke-width="${px(1.8)}" stroke-dasharray="${px(5)} ${px(3)}" pointer-events="none"/>`;
  }
  const cx=smart.find(g=>g.axis==='x'&&g.kind==='layer'),cy=smart.find(g=>g.axis==='y'&&g.kind==='layer');
  if(cx&&cy&&cx.target===cy.target){
    const tagW=px(63),tagH=px(18), tx=clamp(cx.value*U+px(13),0,Math.max(0,w-tagW)),ty=clamp(cy.value*U+px(12),0,Math.max(0,h-tagH));
    s+=`<g class="layer-center-tag" pointer-events="none"><rect x="${tx}" y="${ty}" width="${tagW}" height="${tagH}" rx="${px(9)}" fill="#7625a5"/><text x="${tx+tagW/2}" y="${ty+tagH/2}" dominant-baseline="central" text-anchor="middle" font-size="${px(10)}" font-weight="700" fill="#fff">Centered</text></g>`;
  }
  if (e && e.panel === panel) s += selSvg(e);
  return s + '</g>';
}
function elSvg(e) {
  const iss = issues(e), bad = iss.some((i) => i.lvl === 'no');
  let s = `<g class="el" data-el="${e.id}" transform="translate(${e.x * U} ${e.y * U}) rotate(${e.rot})">`;
  const { w, h } = dims(e); const W2 = w * U / 2, H2 = h * U / 2;
  if (e.type === 'image') { const r = IMGS[e.img]; if (r) s += `<image href="${e.ko ? r.koHref : r.href}" x="${-W2}" y="${-H2}" width="${w * U}" height="${h * U}" preserveAspectRatio="none"/>`; }
  else if (e.type === 'band') s += `<rect x="${-W2}" y="${-H2}" width="${w * U}" height="${h * U}" fill="${e.color}"/>`;
  else if (e.type === 'nf') s += M.nfSvg(e.nf||{},w*U,h*U);
  else if (e.type === 'barcode') s += M.barSvg(e.barType,e.digits,w*U,h*U);
  else if (e.type === 'shape') s += `<path d="${(M.SHAPES[e.shape]||M.SHAPES.rectangle)[1]}" fill="${e.color}" transform="translate(${-W2} ${-H2}) scale(${w*U/100} ${h*U/100})"/>`;
  else if (e.type === 'text') {
    const f = fontOf(e), b = textBox(e), lh = e.size * (e.lead||118) / 100 * U;
    s += `<text font-family="'${f.id}'" font-weight="${f.wt}" font-size="${e.size * U}" letter-spacing="${e.size*U*(e.letter||0)/100}" fill="${e.color}" text-anchor="middle">`;
    b.lines.forEach((t, i) => { s += `<tspan x="0" y="${-H2 + lh * i + lh * 0.5}" dominant-baseline="central">${esc(t) || ' '}</tspan>`; });
    s += `</text>`;
  }
  s += `<rect x="${-W2}" y="${-H2}" width="${w * U}" height="${h * U}" fill="transparent" stroke="${bad ? '#d93025' : 'none'}" stroke-width="${px(2)}" stroke-dasharray="${px(4)} ${px(3)}"/>`;
  return s + '</g>';
}
function selSvg(e) {
  const { w, h } = dims(e); const W2 = w * U / 2 + px(5), H2 = h * U / 2 + px(5), r = px(13), rr = px(22);
  let s = `<g transform="translate(${e.x * U} ${e.y * U}) rotate(${e.rot})">`;
  s += `<rect x="${-W2}" y="${-H2}" width="${W2 * 2}" height="${H2 * 2}" fill="none" stroke="#2a6fdb" stroke-width="${px(2)}" pointer-events="none"/>`;
  s += `<line x1="0" y1="${-H2}" x2="0" y2="${-H2 - rr}" stroke="#2a6fdb" stroke-width="${px(2)}" pointer-events="none"/>`;
  s += `<g data-h="rotate"><circle cx="0" cy="${-H2 - rr - r}" r="${r}" fill="#fff" stroke="#2a6fdb" stroke-width="${px(2.5)}"/><path d="M${-px(5)} ${-H2 - rr - r - px(1)} a${px(5)} ${px(5)} 0 1 1 ${px(1.5)} ${px(4)}" fill="none" stroke="#2a6fdb" stroke-width="${px(2)}"/><circle cx="0" cy="${-H2 - rr - r}" r="${r * 1.5}" fill="transparent"/></g>`;
  s += `<g data-h="resize"><circle cx="${W2}" cy="${H2}" r="${r}" fill="#2a6fdb" stroke="#fff" stroke-width="${px(2.5)}"/><path d="M${W2 - px(4)} ${H2 + px(4)} L${W2 + px(4)} ${H2 - px(4)}" stroke="#fff" stroke-width="${px(2)}"/><circle cx="${W2}" cy="${H2}" r="${r * 1.6}" fill="transparent"/></g>`;
  return s + '</g>';
}
function dimSvg() {
  const w = W() * U, l = L() * U, g = G() * U, fs = px(12), c = '#5f6368';
  const arrowV = (x, y0, y1, t) => { const m = (y0 + y1) / 2; return `<line x1="${x}" y1="${y0 + px(2)}" x2="${x}" y2="${y1 - px(2)}" stroke="${c}" stroke-width="${px(1.2)}" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="${x - px(6)}" y="${m}" font-size="${fs}" fill="#1d1d1f" font-weight="700" text-anchor="middle" transform="rotate(-90 ${x - px(6)} ${m})" dominant-baseline="auto">${t}</text>`; };
  const ty = region().y0 * U;
  let s = `<line x1="0" y1="${ty - px(14)}" x2="${w}" y2="${ty - px(14)}" stroke="${c}" stroke-width="${px(1.2)}" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="${w / 2}" y="${ty - px(19)}" font-size="${fs}" fill="#1d1d1f" font-weight="700" text-anchor="middle">${fmt(W())}″ wide</text>`;
  if(wicket()){
    if(view==='whole')s+=arrowV(-px(14),0,l,`${fmt(L())}″ front`)+arrowV(-px(14),backBody()*U,(backBody()+L())*U,`${fmt(L())}″ back`);
    else s+=arrowV(-px(14),0,l,`${fmt(L())}″ body`);
  } else if (view === 'whole') {
    s += arrowV(-px(14), 0, l, `${fmt(L())}″ front`) + arrowV(-px(14), l, l + g, `${fmt(G())}″`) + arrowV(-px(14), l + g, 2 * l + g, `${fmt(L())}″ back`);
    if (guides && $('#stageBox').clientWidth > 470) s += callouts();
  } else { const r = region(); s += arrowV(-px(14), r.y0 * U, l, zoom ? `bottom ${fmt(Math.round((L() - r.y0) * 4) / 4)}″ of ${fmt(L())}″` : `${fmt(L())}″ long`); }
  return s;
}
function callouts() {
  const w = W() * U, l = L() * U, g = G() * U, z = zones(), x0 = w + px(14), tx = w + px(30);
  const items = [
    { y: TRIM / 2 * U, ay: TRIM / 2 * U, ax: w, c: '#a1271c', t: ['Top trim & opening', 'no print'] },
    { y: (TRIM + z.twist) / 2 * U, ay: (TRIM + z.twist) / 2 * U, ax: w, c: '#6b5000', t: ['Twist-tie area', 'gathers, keep logo below'] },
    { y: (z.twist + L()) / 2 * U, ay: (z.twist + L()) / 2 * U, ax: w - SEAL * U - SAFE * U, c: '#11602f', t: ['Safe print area', 'your logo & words go here'] },
    { y: (L() * 0.86) * U, ay: (L() * 0.86) * U, ax: w - SEAL * U / 2, c: '#a1271c', t: ['Side seals', 'no print'] },
    { y: (l + g / 2), ay: l + g / 2, ax: w, c: '#6b5000', t: ['Bottom gusset', 'folds under the bag'] },
    { y: (l + g + l / 2), ay: l + g + l / 2, ax: w, c: '#1d1d1f', t: ['Back panel', 'upside down on the roll'] },
    { y: (2 * l + g) - px(6), ay: null, c: '#1d1d1f', t: [`Flat: ${fmt(W())}″ × ${fmt(2 * L() + G())}″`], bold: true },
  ];
  const gap = px(32); let prev = -Infinity;
  for (const it of items) { it.ly = Math.max(it.y, prev + gap); prev = it.ly; }
  const over = prev - (2 * l + g); if (over > 0) { for (let i = items.length - 1, lim = 2 * l + g; i >= 0; i--) { items[i].ly = Math.min(items[i].ly, lim); lim = items[i].ly - gap; } }
  let s = '';
  for (const it of items) {
    if (it.ay != null) s += `<circle cx="${it.ax}" cy="${it.ay}" r="${px(3)}" fill="${it.c}"/><polyline points="${it.ax},${it.ay} ${x0},${it.ay} ${x0 + px(8)},${it.ly} ${tx - px(4)},${it.ly}" fill="none" stroke="${it.c}" stroke-width="${px(1.2)}"/>`;
    s += `<text x="${tx}" y="${it.ly - (it.t[1] ? px(6) : 0)}" font-size="${px(12)}" font-weight="700" fill="${it.c}" dominant-baseline="middle">${esc(it.t[0])}</text>`;
    if (it.t[1]) s += `<text x="${tx}" y="${it.ly + px(8)}" font-size="${px(10.5)}" fill="#5f6368" dominant-baseline="middle">${esc(it.t[1])}</text>`;
  }
  return s;
}
function gussetSvg() {
  const w = W() * U, l = L() * U, g = G() * U;
  let s = `<g pointer-events="none"><rect x="0" y="${l}" width="${w}" height="${g}" fill="${S.bg || (S.film === 'white' ? '#fff' : '#f4f8fb')}"/><rect x="0" y="${l}" width="${w}" height="${g}" fill="url(#hCare)"/>`;
  s += `<rect x="0" y="${l}" width="${w}" height="${g}" fill="none" stroke="#1d1d1f" stroke-width="${px(1.5)}"/>`;
  s += `<line x1="0" y1="${l + g / 2}" x2="${w}" y2="${l + g / 2}" stroke="#1d1d1f" stroke-width="${px(1.2)}" stroke-dasharray="${px(6)} ${px(4)}"/>`;
  return s + '</g>';
}
function render() {
  layout();
  const p = (id, col) => `<pattern id="${id}" width="${px(8)}" height="${px(8)}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${px(8)}" height="${px(8)}" fill="${col}" fill-opacity=".14"/><rect width="${px(3)}" height="${px(8)}" fill="${col}" fill-opacity=".5"/></pattern>`;
  let s = `<defs>${p('hNo', '#d93025')}${p('hCare', '#d9a300')}<marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="${6}" markerHeight="${6}" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9" fill="none" stroke="#5f6368" stroke-width="1.6"/></marker></defs>`;
  if (view === 'whole') s += panelSvg('front', false) + (wicket()?'':gussetSvg()) + panelSvg('back', true);
  else s += panelSvg(view, false);
  s += dimSvg();
  svg.innerHTML = s;
  $('#empty').hidden = !!S.els.length;
}

/* ---------- interaction on the dieline ---------- */
let drag = null;
function toPanel(ev, panel) {
  const g = svg.querySelector(`#p-${panel}`); if (!g) return null;
  const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
  const q = pt.matrixTransform(g.getScreenCTM().inverse()); return { x: q.x / U, y: q.y / U };
}
svg.addEventListener('pointerdown', (ev) => {
  const h = ev.target.closest('[data-h]'), t = ev.target.closest('[data-el]');
  if (!h && !t) { if (sel) { sel = null; syncAll(); } return; }
  const e = h ? curEl() : S.els.find((q) => q.id === t.dataset.el); if (!e) return;
  if (sel !== e.id) { sel = e.id; syncAll(); }
  const p = toPanel(ev, e.panel); if (!p) return;
  drag = { mode: h ? h.dataset.h : 'move', e, p0: p, x0: e.x, y0: e.y, rot0: e.rot, size0: e.size, w0: e.w, h0: e.h, d0: Math.hypot(p.x - e.x, p.y - e.y) || 0.01, a0: Math.atan2(p.y - e.y, p.x - e.x), moved: false };
  if (drag.mode==='move') $('#selbar').style.visibility='hidden';
  svg.setPointerCapture(ev.pointerId); ev.preventDefault();
});
svg.addEventListener('pointermove', (ev) => {
  if (!drag) return; const p = toPanel(ev, drag.e.panel); if (!p) return; const e = drag.e;
  if (drag.mode === 'move') { e.x = drag.x0 + p.x - drag.p0.x; e.y = drag.y0 + p.y - drag.p0.y; e.x = clamp(e.x, -1, W() + 1); e.y = clamp(e.y, -1, L() + 1);
    drag.guides=[];
    if(!ev.altKey){
      const tol=Math.min(.25,px(ev.pointerType==='touch'?9:7)/U), index=S.els.indexOf(e);
      const geo=(q,i)=>({...q,index:i,box:bbox(q)});
      const pos=globalThis.MetroAlignment.snap(geo(e,index),S.els.map(geo),W(),L(),tol);
      e.x=pos.x;e.y=pos.y;drag.guides=pos.guides;
    }
  }
  else if (drag.mode === 'resize') {
    const k = clamp(Math.hypot(p.x - e.x, p.y - e.y) / drag.d0, 0.05, 20);
    if (e.type === 'text') e.size = clamp(drag.size0 * k, 0.08, 6);
    else if (e.type === 'band') { e.h = clamp(drag.h0 * k, 0.1, L()); }
    else { const nw = clamp(drag.w0 * k, 0.2, 30); e.h = drag.h0 * nw / drag.w0; e.w = nw; }
  } else if (drag.mode === 'rotate') {
    let a = (Math.atan2(p.y - e.y, p.x - e.x) - drag.a0) * 180 / Math.PI + drag.rot0;
    a = ((a + 540) % 360) - 180; for (const s of [-180, -90, 0, 90, 180]) if (Math.abs(a - s) < 5) a = s; e.rot = Math.round(a);
  }
  drag.moved = true; queue();
});
const endDrag = () => { if (!drag) return; const m = drag.moved; drag = null; $('#selbar').style.visibility=''; if (m) { syncAll(); commit(); } };
svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);
svg.addEventListener('dblclick', (ev) => { const t = ev.target.closest('[data-el]'); if (t) { const e = S.els.find((q) => q.id === t.dataset.el); if (e && e.type === 'text') { $('#tText').focus(); $('#tText').select(); } } });
let raf = 0; function queue() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; render(); if (!drag) syncWarns(); }); }

/* ---------- panel sync ---------- */
function setView(v) { view = v; syncCreative(); $$('#views button').forEach((b) => b.setAttribute('aria-selected', b.dataset.view === v)); syncZoom(); render(); }
function syncAll() { render(); syncProps(); syncWarns(); syncInks(); syncChecks(); syncSizes(); syncCreative(); }
function syncSizes() {
  $('#bagKind').value=S.type;
  $('#sizes').innerHTML = sizesFor().map((s, i) => `<button role="radio" data-i="${i}" aria-checked="${s.w === S.size.w && s.g === S.size.g && s.l === S.size.l}">${fmt(s.w)} × ${fmt(s.g)} × ${fmt(s.l)}″</button>`).join('');
  for (const k of ['w', 'g', 'l']) { const i = $('#i' + k); if (document.activeElement !== i) i.value = S.size[k]; }
  $('#flatNote').innerHTML = wicket()?`Back wicket lip: <b>2″</b>`:`Flat dieline: <b>${fmt(W())} × ${fmt(2*L()+G())}″</b>`;
}
function syncProps() {
  const e = curEl(); $('#props').hidden = !e; $('#selbar').hidden = !e;
  if (!e) return;
  $('#propsTitle').textContent = 'Selected: ' + ELNAME(e);
  $('#propText').hidden = e.type !== 'text'; $('#propLogo').hidden = e.type !== 'image'; $('#propColor').hidden = !['text','band','shape'].includes(e.type); $('#labelProps').hidden = !['nf','barcode'].includes(e.type); $('#editLabel').textContent=e.type==='nf'?'Edit Nutrition Facts':'Edit barcode';
  $('#flipBtn').textContent = e.panel === 'front' ? 'To back' : 'To front';
  $('[data-sel=edit]').hidden = !['text','nf','barcode'].includes(e.type);
  if (e.type === 'text') {
    if (document.activeElement !== $('#tText')) $('#tText').value = e.text;
    $('#letterSpace').value=e.letter||0; $('#lineSpace').value=e.lead||118; renderSpacing(e);
    $('#fonts').innerHTML = FONTS.map((f) => `<button role="radio" data-font="${esc(f.id)}" aria-checked="${f.id === e.font}" style="font-family:'${f.id}';font-weight:${f.wt}">Aa<small>${f.label}</small></button>`).join('');
  }
  if (['text','band','shape'].includes(e.type)) $('#elColors').innerHTML = swatches(e.color, false);
  if (e.type === 'image') { $('#koWhite').checked=!!e.ko; $('#logoInks').textContent='List the actual artwork inks in Colors. The preview does not infer plates from an image.'; }
  const sz = e.type === 'text' ? e.size : e.type === 'band' ? e.h : e.w;
  const [a, b] = e.type === 'text' ? [0.08, 4] : e.type === 'band' ? [0.1, L() / 2] : [0.2, W() * 1.2];
  $('#tSize').value = Math.round(100 * Math.log(sz / a) / Math.log(b / a)); $('#tSize').dataset.a = a; $('#tSize').dataset.b = b;
  $('#tRot').value = e.rot;
}
function swatches(cur, withNone) {
  const used = inks().map((i) => i.c).filter(Boolean); const all = [...new Set([...used, ...SUGGEST.map((c) => c.toLowerCase())])].slice(0, 12);
  let s = withNone ? `<button class="sw none" data-c="" role="radio" aria-checked="${!cur}" aria-label="No background color" title="None"></button>` : '';
  s += all.map((c) => `<button class="sw" data-c="${c}" role="radio" aria-checked="${!!cur && cur.toLowerCase() === c}" style="background:${c}" aria-label="Color ${c}" title="${c}"></button>`).join('');
  s += `<span class="sw pick" title="Pick any color"><input type="color" aria-label="Pick any color" value="${cur || '#1d1d1f'}"></span>`;
  return s;
}
function syncInks() {
  const plan=M.inkPlan(S),list=plan.items,n=list.length;$('#inks').className='inks'+(n>MAX_INKS?' over':'');
  const dots=list.map(i=>`<span class="ink-pill">${i.c?`<i style="background:${i.c}"></i>`:''}${esc(i.name)}</span>`).join('');
  $('#inks').innerHTML=`<b>${n} ${plan.artworkUnknown?'known + artwork to confirm':'listed'} ink${n===1?'':'s'}</b><div class="ink-list">${dots}</div>${n>MAX_INKS?'<p class="note">More than eight listed. Confirm the printing approach with the art team.</p>':''}`;
  if(document.activeElement!==$('#declared'))$('#declared').value=S.declared||'';
  $('#bgColors').innerHTML=swatches(S.bg,true); $$('#film button').forEach(b=>b.setAttribute('aria-checked',b.dataset.film===S.film));
}
function syncWarns() {
  const out = [];
  for (const e of S.els) for (const i of issues(e)) out.push({ e, i });
  const n = inks().length;
  const maxW = matchMedia('(max-width:900px)').matches ? 1 : 4;
  let s = out.slice(0, maxW).map(({ e, i }) => `<div class="warn ${i.lvl === 'no' ? '' : 'care'}"><span><b>${esc(ELNAME(e))}</b> ${i.lvl === 'no' ? 'is in a no-print zone' : 'is in'}: ${esc(i.where)}${e.panel === 'back' ? ' (back)' : ''}.</span>${e.type==='band'&&i.lvl==='care'?'':`<button data-fix="${e.id}">Fix it</button>`}</div>`).join('');
  if (out.length > maxW) s += `<div class="warn care"><span>+${out.length - maxW} more to check</span></div>`;
  if (n > MAX_INKS) s += `<div class="warn"><span><b>${n} listed inks.</b> Ask the art team to review the ink count.</span></div>`;

  $('#warns').innerHTML = s;
}
function syncChecks() {
  $('#checklist').innerHTML = CHECK.map((c) => {
    const placed = S.els.some((e) => e.kind === c.k), done = placed || !!S.manual[c.k];
    return `<li class="${done ? 'done' : ''}"><input type="checkbox" data-ck="${c.k}" ${done ? 'checked' : ''} ${placed ? 'disabled' : ''} aria-label="${esc(c.t)} is on my design"><span class="t"><b>${esc(c.t)}</b><small>${placed ? 'Added. Use Edit to change the contents.' : esc(c.d)}</small></span>${placed ? `<button data-show="${c.k}">Edit</button>` : `<button data-add="${c.k}">Add</button>`}</li>`;
  }).join('');
}

/* ---------- controls ---------- */
$('#views').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b) setView(b.dataset.view); });
$('#zoomBtn').addEventListener('click', () => { zoom = !zoom; syncZoom(); render(); });
function syncZoom() { $('#zoomBtn').hidden = view === 'whole'; $('#zoomBtn').setAttribute('aria-pressed', zoom); $('#zoomBtn').title = zoom ? 'Show the whole side' : 'Zoom in on the print area'; }
$('#undoBtn').addEventListener('click', undo); $('#redoBtn').addEventListener('click', redo);
$('#sizes').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; S.size = { ...sizesFor()[+b.dataset.i] }; syncAll(); commit(); });
let sizeT = 0;
for (const k of ['w', 'g', 'l']) {
  $('#i' + k).addEventListener('input', (ev) => { const v = parseFloat(ev.target.value); if (!isFinite(v)) return; S.size[k] = clamp(Math.round(v * 8) / 8, LIM[k][0], LIM[k][1]); clearTimeout(sizeT); sizeT = setTimeout(() => { syncAll(); commit(); }, 200); });
  $('#i' + k).addEventListener('change', (ev) => { ev.target.value = S.size[k]; });
}
$('#file').addEventListener('change', (ev) => { loadFile(ev.target.files[0]); ev.target.value = ''; });
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('[data-act]');
  if (a) { if (a.dataset.act === 'logo') $('#file').click(); else if (a.dataset.act === 'text') { addText('Your words here'); setTimeout(() => { $('#tText').focus(); $('#tText').select(); }, 50); } else if (a.dataset.act === 'shape') addBand(); return; }
  const fx = ev.target.closest('[data-fix]'); if (fx) { const e = S.els.find((q) => q.id === fx.dataset.fix); if (e) { if (view === 'whole' || view !== e.panel) setView(e.panel); fixEl(e); sel = e.id; syncAll(); commit(); toast('Moved inside the safe print area'); } return; }
  const ad = ev.target.closest('[data-add]'); if (ad) { addPlaceholder(CHECK.find((c) => c.k === ad.dataset.add)); return; }
  const sh = ev.target.closest('[data-show]'); if (sh) { const e = S.els.find((q) => q.kind === sh.dataset.show); if (e) { sel = e.id; setView(e.panel); syncAll(); if(e.type==='nf')openLabel(e);else {$('#props').scrollIntoView({block:'center'});$('#tText').focus({preventScroll:true});} } return; }
});
$('#checklist').addEventListener('change', (ev) => { const c = ev.target.closest('[data-ck]'); if (c) { S.manual[c.dataset.ck] = c.checked; syncChecks(); commit(); } });
$('#selbar').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-sel]'); const e = curEl(); if (!b || !e) return; const a = b.dataset.sel;
  const scale = (k) => { if (e.type === 'text') e.size = clamp(e.size * k, 0.08, 6); else if (e.type === 'band') e.h = clamp(e.h * k, 0.1, L()); else { e.w *= k; e.h *= k; } };
  if (a === 'bigger') scale(1.1); else if (a === 'smaller') scale(1 / 1.1);
  else if (a === 'rotate') e.rot = ((Math.round(e.rot / 90) * 90 + 90 + 180) % 360) - 180;
  else if (a === 'flip') { e.panel = e.panel === 'front' ? 'back' : 'front'; if (view !== 'whole') setView(e.panel); }
  else if (a === 'delete') { S.els = S.els.filter((q) => q !== e); sel = null; }
  else if (a === 'edit') { if (['nf','barcode'].includes(e.type)) {openLabel(e);return;} $('#props').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#tText').focus(), 300); return; }
  syncAll(); commit();
});
function renderSpacing(e){$('#letterOut').value=(e.letter||0)+'%';$('#lineOut').value=(e.lead||118)+'%';}
for (const [id,key] of [['letterSpace','letter'],['lineSpace','lead']]){const input=$('#'+id);input.addEventListener('input',()=>{const e=curEl();if(!e||e.type!=='text')return;e[key]=+input.value;renderSpacing(e);queue();});input.addEventListener('change',()=>{syncAll();commit();});}
$('#declared').addEventListener('input',ev=>{S.declared=ev.target.value;syncInks();syncWarns();});$('#declared').addEventListener('change',commit);
$('#deselect').addEventListener('click', () => { sel = null; syncAll(); });
$('#tText').addEventListener('input', (ev) => { const e = curEl(); if (e && e.type === 'text') { const before = issues(e).some((i) => i.lvl === 'no'); e.text = ev.target.value; if (!before && Math.abs(e.rot % 180) < 1) { fitWidth(e); const b = bbox(e), sf = zones().safe; if (b.x0 < sf.x0 || b.x1 > sf.x1) e.x = W() / 2; } queue(); clearTimeout(sizeT); sizeT = setTimeout(() => { syncAll(); commit(); }, 500); } });
$('#tText').addEventListener('blur', () => commit());
$('#fonts').addEventListener('click', (ev) => { const b = ev.target.closest('[data-font]'); const e = curEl(); if (!b || !e) return; e.font = b.dataset.font; ensureFont(e.font).then(() => { syncAll(); commit(); }); });
function colorPick(ev, set) { const b = ev.target.closest('[data-c]'); if (b) set(b.dataset.c || null); }
$('#elColors').addEventListener('click', (ev) => colorPick(ev, (c) => { const e = curEl(); if (e && c) { e.color = c; syncAll(); commit(); } }));
$('#elColors').addEventListener('input', (ev) => { if (ev.target.type === 'color') { const e = curEl(); if (e) { e.color = ev.target.value; queue(); syncInks(); } } });
$('#elColors').addEventListener('change', (ev) => { if (ev.target.type === 'color') { syncAll(); commit(); } });
$('#bgColors').addEventListener('click', (ev) => colorPick(ev, (c) => { S.bg = c; syncAll(); commit(); }));
$('#bgColors').addEventListener('input', (ev) => { if (ev.target.type === 'color') { S.bg = ev.target.value; queue(); } });
$('#bgColors').addEventListener('change', (ev) => { if (ev.target.type === 'color') { syncAll(); commit(); } });
$('#film').addEventListener('click', (ev) => { const b = ev.target.closest('[data-film]'); if (!b) return; S.film = b.dataset.film; syncAll(); commit(); });
$('#koWhite').addEventListener('change', (ev) => { const e = curEl(); if (e) { e.ko = ev.target.checked; syncAll(); commit(); } });
$('#tSize').addEventListener('input', (ev) => { const e = curEl(); if (!e) return; const a = +ev.target.dataset.a, b = +ev.target.dataset.b; const v = a * Math.pow(b / a, ev.target.value / 100);
  if (e.type === 'text') e.size = v; else if (e.type === 'band') e.h = v; else { e.h = e.h * v / e.w; e.w = v; } queue(); });
$('#tSize').addEventListener('change', () => { syncAll(); commit(); });
$('#tRot').addEventListener('input', (ev) => { const e = curEl(); if (!e) return; let a = +ev.target.value; for (const s of [-90, 0, 90]) if (Math.abs(a - s) < 4) a = s; e.rot = a; queue(); });
$('#tRot').addEventListener('change', () => { syncAll(); commit(); });
document.addEventListener('keydown', (ev) => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || $('#quote').open || sd.open;
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'z' && !typing) { ev.preventDefault(); ev.shiftKey ? redo() : undo(); return; }
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'y' && !typing) { ev.preventDefault(); redo(); return; }
  if (typing) return; const e = curEl(); if (!e) return;
  if (ev.key === 'Delete' || ev.key === 'Backspace') { S.els = S.els.filter((q) => q !== e); sel = null; syncAll(); commit(); ev.preventDefault(); }
  const step = ev.shiftKey ? 0.25 : 0.0625, mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[ev.key];
  if (mv) { e.x += mv[0]; e.y += mv[1]; syncAll(); commit(); ev.preventDefault(); }
  if (ev.key === 'Escape') { sel = null; syncAll(); }
});
new ResizeObserver(() => render()).observe($('#stageBox'));
const fontsReady = {};
function ensureFont(f) { const d = FONTS.find((q) => q.id === f) || FONTS[0]; return fontsReady[f] || (fontsReady[f] = document.fonts ? document.fonts.load(`${d.wt} 40px "${d.id}"`).catch(() => {}) : Promise.resolve()); }

/* ---------- raster output (3D, PNG) ---------- */
function drawEl(ctx, e, ppi) {
  const { w, h } = dims(e); ctx.save(); ctx.translate(e.x * ppi, e.y * ppi); ctx.rotate(e.rot * Math.PI / 180);
  if (e.type === 'image') { const r = IMGS[e.img]; if (r) ctx.drawImage(e.ko ? r.ko : r.src, -w * ppi / 2, -h * ppi / 2, w * ppi, h * ppi); }
  else if (e.type === 'band') { ctx.fillStyle = e.color; ctx.fillRect(-w * ppi / 2, -h * ppi / 2, w * ppi, h * ppi); }
  else if (e.type === 'nf') M.nfCanvas(ctx,e.nf||{},w*ppi,h*ppi);
  else if (e.type === 'barcode') M.barCanvas(ctx,e.barType,e.digits,w*ppi,h*ppi);
  else if (e.type === 'shape') {ctx.translate(-w*ppi/2,-h*ppi/2);ctx.scale(w*ppi/100,h*ppi/100);ctx.fillStyle=e.color;ctx.fill(new Path2D((M.SHAPES[e.shape]||M.SHAPES.rectangle)[1]));}
  else if (e.type === 'text') {
    const f = fontOf(e), b = textBox(e), lh = e.size * (e.lead||118) / 100 * ppi; ctx.fillStyle = e.color; ctx.font = `${f.wt} ${e.size * ppi}px "${f.id}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if('letterSpacing' in ctx)ctx.letterSpacing=`${e.size*ppi*(e.letter||0)/100}px`;
    b.lines.forEach((t, i) => ctx.fillText(t, 0, -h * ppi / 2 + lh * i + lh * 0.5));
  }
  ctx.restore();
}
function panelCanvas(panel, ppi, withBg) {
  const c = document.createElement('canvas'); c.width = Math.round(W() * ppi); c.height = Math.round(L() * ppi); const x = c.getContext('2d');
  if (withBg) { const bg = S.bg || (S.film === 'white' ? '#ffffff' : null); if (bg) { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); } }
  for (const e of S.els.filter((q) => q.panel === panel)) drawEl(x, e, ppi);
  return c;
}
async function fontsAll() { await Promise.all([...new Set(S.els.filter((e) => e.type === 'text').map((e) => e.font))].map(ensureFont)); }
async function proofPng() { // true-to-scale proof: the whole flat dieline with the art in place
  await fontsAll();
  const ppi = Math.min(100, Math.floor(6000 / (2 * L() + G()))), m = Math.round(1.1 * ppi), head = Math.round(1.3 * ppi);
  if(wicket())return wicketPng(ppi,m,head);
  const w = Math.round(W() * ppi), l = Math.round(L() * ppi), g = Math.round(G() * ppi);
  const c = document.createElement('canvas'); c.width = w + 2 * m + Math.round(1.6 * ppi); c.height = head + 2 * l + g + m; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
  const filmFill = S.bg || (S.film === 'white' ? '#ffffff' : '#eef3f7');
  const pnl = (panel, oy, flip) => {
    x.save(); x.translate(m, oy); if (flip) { x.translate(w, l); x.rotate(Math.PI); }
    x.fillStyle = filmFill; x.fillRect(0, 0, w, l); x.save(); x.beginPath(); x.rect(0, 0, w, l); x.clip(); for (const e of S.els.filter((q) => q.panel === panel)) drawEl(x, e, ppi); x.restore();
    const z = zones(), sf = z.safe; x.lineWidth = Math.max(1, ppi / 40);
    x.fillStyle = 'rgba(217,48,37,.18)'; x.fillRect(0, 0, w, TRIM * ppi); x.fillRect(0, TRIM * ppi, SEAL * ppi, l - TRIM * ppi); x.fillRect(w - SEAL * ppi, TRIM * ppi, SEAL * ppi, l - TRIM * ppi);
    x.setLineDash([ppi / 10, ppi / 14]); x.strokeStyle = '#1f9d55'; x.strokeRect(sf.x0 * ppi, sf.y0 * ppi, (sf.x1 - sf.x0) * ppi, (sf.y1 - sf.y0) * ppi);
    x.strokeStyle = '#b58800'; x.beginPath(); x.moveTo(0, z.twist * ppi); x.lineTo(w, z.twist * ppi); x.stroke(); x.setLineDash([]);
    x.strokeStyle = '#1d1d1f'; x.strokeRect(0, 0, w, l); x.restore();
  };
  pnl('front', head, false);
  x.fillStyle = filmFill; x.fillRect(m, head + l, w, g); x.fillStyle = 'rgba(217,163,0,.18)'; x.fillRect(m, head + l, w, g); x.strokeStyle = '#1d1d1f'; x.strokeRect(m, head + l, w, g);
  x.setLineDash([ppi / 8, ppi / 12]); x.beginPath(); x.moveTo(m, head + l + g / 2); x.lineTo(m + w, head + l + g / 2); x.stroke(); x.setLineDash([]);
  pnl('back', head + l + g, true);
  x.fillStyle = '#1d1d1f'; x.font = `700 ${Math.round(ppi * 0.32)}px "Josefin Sans", sans-serif`; x.textBaseline = 'top'; x.textAlign = 'left';
  x.fillText(`Bottom gusset bread bag · ${fmt(W())} × ${fmt(G())} × ${fmt(L())}″ (W × G × L)`, m, Math.round(ppi * 0.25));
  x.font = `400 ${Math.round(ppi * 0.22)}px "Josefin Sans", sans-serif`; x.fillStyle = '#5f6368';
  x.fillText(`Flat ${fmt(W())} × ${fmt(2 * L() + G())}″ · ${S.film === 'clear' ? 'clear' : 'white'} film · ${inks().length} listed inks · design review, not press-ready`, m, Math.round(ppi * 0.7));
  x.save(); x.font = `700 ${Math.round(ppi * 0.2)}px "Josefin Sans", sans-serif`; x.fillStyle = '#1d1d1f'; x.textAlign = 'left'; x.textBaseline = 'middle';
  const lx = m + w + Math.round(ppi * 0.25);
  x.fillText('FRONT', lx, head + l / 2); x.fillText('GUSSET', lx, head + l + g / 2); x.fillText('BACK', lx, head + l + g + l / 2); x.font = `400 ${Math.round(ppi * 0.16)}px "Josefin Sans", sans-serif`; x.fillText('(upside down', lx, head + l + g + l / 2 + ppi * 0.28); x.fillText('on the roll)', lx, head + l + g + l / 2 + ppi * 0.5); x.restore();
  return c;
}
function wicketPng(ppi,m,head){
  const w=Math.round(W()*ppi),l=Math.round(L()*ppi),lip=Math.round(WICKET_LIP*ppi),gap=Math.round(.65*ppi), c=document.createElement('canvas');
  c.width=w+2*m;c.height=head+l+gap+lip+l+m;const x=c.getContext('2d'), film=S.bg||(S.film==='white'?'#fff':'#eef3f7');
  x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.fillStyle='#263342';x.font=`700 ${.29*ppi}px Inter, sans-serif`;
  x.fillText(`Wicketed bag · ${fmt(W())} × ${fmt(L())}″ + ${fmt(G())}″ BG`,m,ppi*.45);x.font=`400 ${.175*ppi}px Inter, sans-serif`;x.fillText('Design review only · schematic, not for production',m,ppi*.81);
  const body=(panel,y)=>{x.fillStyle=film;x.fillRect(m,y,w,l);x.drawImage(panelCanvas(panel,ppi,false),m,y);x.strokeStyle='#333742';x.lineWidth=Math.max(1,ppi*.021);x.strokeRect(m,y,w,l);};
  body('front',head); const b=head+l+gap;x.fillStyle='#e7ecf3';x.fillRect(m,b,w,lip);x.strokeStyle='#333742';x.strokeRect(m,b,w,lip);
  for(const d of [-1,1]){x.beginPath();x.arc(m+w/2+d*holeOffset()*ppi,b+.9*ppi,.236*ppi,0,Math.PI*2);x.fillStyle='white';x.fill();x.stroke();}
  body('back',b+lip);return c;
}
function layoutJson() {
  const z = zones();
  return {
    tool: 'metropack.com Design your bag (preview)', version: 2, created: new Date().toISOString(),
    bag: wicket()?{type:'wicketed bag',units:'in',width:W(),gusset:G(),length:L(),review_only:true,back_lip:WICKET_LIP}: { type: 'bottom gusset bread bag', units: 'in', width: W(), gusset: G(), length: L(), flat: { width: W(), height: 2 * L() + G(), order: 'front (upright) / bottom gusset / back (upside down)' } },
    zones: { side_seal_each: SEAL, top_trim: TRIM, safety_margin: SAFE, twist_tie_area_from_top: wicket()?null:+z.twist.toFixed(3), safe_print_area: z.safe },
    film: S.film, background: S.bg, ink_colors: inks().map((i) => ({ hex: i.c, name:i.name, from: i.from })), artwork_ink_count_unconfirmed:M.inkPlan(S).artworkUnknown,
    items: S.els.map((e) => { const d = dims(e); const o = { kind: e.kind || e.type, panel: e.panel, center_in: { x: +e.x.toFixed(3), y: +e.y.toFixed(3) }, size_in: { w: +d.w.toFixed(3), h: +d.h.toFixed(3) }, rotation_deg: e.rot, warnings: issues(e).map((i) => i.where) };
      if (e.type === 'text') Object.assign(o, { text: e.text, font: e.font, color: e.color, font_size_in: +e.size.toFixed(3) });
      if (e.type==='nf') o.nutrition=e.nf||{}; if (e.type==='barcode'){o.barcode_format=e.barType;o.barcode_digits=e.digits;} if(e.type==='shape')o.shape=e.shape;
      if (e.type === 'band' || e.type==='shape') o.color = e.color; if (e.type === 'image') { o.file = (IMGS[e.img] || {}).name; o.white_background_removed = !!e.ko; }
      return o; }),
    label_checklist: Object.fromEntries(CHECK.map((c) => [c.k, S.els.some((e) => e.kind === c.k) ? 'spot on design' : (S.manual[c.k] ? 'customer says covered' : 'open')])),
  };
}
const toBlob = (c) => new Promise((r) => c.toBlob(r, 'image/png'));
let pkg = null;
async function buildPackage() {
  const c = await proofPng(); const png = await toBlob(c); const json = new Blob([JSON.stringify(layoutJson(), null, 2)], { type: 'application/json' });
  if (pkg) { URL.revokeObjectURL(pkg.pngUrl); URL.revokeObjectURL(pkg.jsonUrl); }
  const base = `${wicket()?'wicketed':'bread'}-bag-${fmt(W())}x${fmt(G())}x${fmt(L())}`.replace(/[½¼¾]/g, (m) => ({ '½': '.5', '¼': '.25', '¾': '.75' }[m]));
  pkg = { png, json, pngUrl: URL.createObjectURL(png), jsonUrl: URL.createObjectURL(json), pngName: `${base}-design.png`, jsonName: `${base}-layout.json`, thumb: c };
  return pkg;
}
const kb = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
function dl(url, name) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
$('#dlBtn').addEventListener('click', async () => { const p = await buildPackage(); dl(p.pngUrl, p.pngName); setTimeout(() => dl(p.jsonUrl, p.jsonName), 400); });

/* ---------- 3D + shelf (the existing mockup, embedded) ---------- */
const frame = $('#mock'); let mockReady = null, v3mode = '3d';
function mockApi() {
  if (!mockReady) mockReady = new Promise((res, rej) => {
    frame.src = 'mockup/index.html?embed=1&v=12'; const t0 = Date.now();
    const poll = () => { const w = frame.contentWindow; if (w && w.__mockup && w.__mockup.setDesign) res(w.__mockup); else if (Date.now() - t0 > 30000) rej(new Error('3D did not start')); else setTimeout(poll, 120); };
    frame.addEventListener('load', poll, { once: true });
  });
  return mockReady;
}
async function open3d(mode) {
  v3mode = mode; $('#v3download').disabled=true; $('#photoFaces').hidden=true; $('#viewer3d').hidden = false; document.body.style.overflow = 'hidden'; $('#v3load').hidden = false; $('#v3load').textContent = 'Building your bag in 3D…';
  $$('#v3mode button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.m === mode));
  try {
    const api = await mockApi(); await fontsAll(); frame.contentWindow.__paused = false;
    api.setDesign({type:S.type,front:panelCanvas('front',98,false),back:panelCanvas('back',98,false),fullPanels:true,size:{w:W(),h:L(),g:G()},film:S.bg||(S.film==='clear'?'clear':'#ffffff')});
    if (mode === 'shelf') api.enterShelf(); else { if (api.state.mode === 'shelf') api.exitShelf(); api.setView('angle'); }
    $('#v3info').innerHTML = `<b>${fmt(W())} × ${fmt(G())} × ${fmt(L())}″</b> ${wicket()?'wicketed bag':'bread bag'} · ${S.film === 'clear' ? 'clear' : 'white'} film · ${inks().length} listed ink${inks().length === 1 ? '' : 's'}`;
    $('#v3load').hidden = true;$('#photoFaces').hidden=mode!=='3d';$('#v3download').disabled=false;
  } catch (err) { $('#v3load').textContent = "Your browser couldn't start the 3D view. Try Safari or Chrome."; }
}
$('#see3d').addEventListener('click', () => open3d('3d'));
$('#seeShelf').addEventListener('click', () => open3d('shelf'));
$('#v3mode').addEventListener('click', (ev) => { const b = ev.target.closest('[data-m]'); if (b && b.dataset.m !== v3mode) open3d(b.dataset.m); });
function close3d() { $('#viewer3d').hidden = true; document.body.style.overflow = ''; if (frame.contentWindow) frame.contentWindow.__paused = true; }
$('#v3close').addEventListener('click', () => {const b=v3mode==='shelf'?'#seeShelf':'#see3d';close3d();$(b).focus({preventScroll:true});});
$('#guidesToggle').addEventListener('click',()=>{guides=!guides;$('#guidesToggle').setAttribute('aria-pressed',guides);$('#guideLegend').hidden=!guides;render();});
document.addEventListener('keydown', ev=>{if(ev.key==='Escape'&&!$('#viewer3d').hidden){const b=v3mode==='shelf'?'#seeShelf':'#see3d';close3d();$(b).focus({preventScroll:true});}});
$('#photoFaces').addEventListener('click',e=>{const face=e.target.closest('[data-photo-face]')?.dataset.photoFace, api=frame.contentWindow?.__mockup;if(api&&face&&v3mode==='3d')api.setView(face,true);});
$('#v3download').addEventListener('click',async()=>{const api=frame.contentWindow?.__mockup;if(api&&$('#v3load').hidden)await api.download();});
$('#v3quote').addEventListener('click', () => { close3d(); openQuote(); });

/* Label dialog and proof export. */
const labelDialog = $('#labelEditor'); let labelEl=null, labelMode='nf';
function openLabel(e=null,mode='nf') {
  labelEl=e;labelMode=e?.type==='barcode'?'barcode':mode;
  const nf=e?.nf||{}, val=k=>M.E(nf[k]??''); $('#labelError').textContent='';
  if(labelMode==='nf') {
    $('#labelTitle').textContent='Nutrition Facts';
    const field=(k,title,mode='decimal')=>`<label>${title}<input name="${k}" value="${val(k)}" inputmode="${mode}" maxlength="${mode==='text'?55:14}"></label>`;
    const rows=M.NF.map(([k,n,u,dv])=>`<div class="nut-row"><label for="nf-${k}">${n}</label><div class="nut-cell"><input name="${k}" id="nf-${k}" type="text" maxlength="12" inputmode="decimal" aria-label="${n} amount in ${u}" value="${val(k)}"><span>${u}</span></div>${dv?`<div class="nut-cell"><input name="${k}DV" type="text" maxlength="6" inputmode="decimal" aria-label="${n} percent daily value" value="${val(k+'DV')}"><span>%</span></div>`:'<span class="na" aria-hidden="true">—</span>'}</div>`).join('');
    $('#labelBody').innerHTML=`<p class="note label-help">Enter your verified data. Fields start blank; nothing is calculated. Check the finished label before printing.</p><div class="nut-general">${field('servings','Servings per container')}${field('servingSize','Serving size','text')}${field('calories','Calories')}</div><div class="nut-row nut-head"><b>Nutrient</b><b>Amount</b><b>% DV</b></div>${rows}<label class="full nut-foot">Footnote<textarea name="foot" rows="3" maxlength="200">${M.E(nf.foot===undefined?M.foot:nf.foot)}</textarea></label>`;
  } else {
    $('#labelTitle').textContent='UPC-A / EAN-13 barcode';
    $('#labelBody').innerHTML=`<p class="note label-help">Use the number assigned to your product. We check the last digit and draw the correct bars. Verify a scan on the actual printed bag.</p><div class="bar-form"><label>Barcode format<select name="format"><option value="upc" ${e?.barType!=='ean'?'selected':''}>UPC-A (12 digits)</option><option value="ean" ${e?.barType==='ean'?'selected':''}>EAN-13 (13 digits)</option></select></label><label>Barcode number<input name="digits" type="text" inputmode="numeric" maxlength="13" value="${M.E(e?.digits||'')}" autocomplete="off"></label></div>`;
  }
  if(!labelDialog.open)labelDialog.showModal();
}
$('#editLabel').addEventListener('click',()=>{const e=curEl();if(e)openLabel(e);});
$('#addBarcode').addEventListener('click',()=>openLabel(null,'barcode')); $('#labelClose').addEventListener('click',()=>labelDialog.close());
$('#labelForm').addEventListener('submit',ev=>{
 ev.preventDefault();const data=Object.fromEntries(new FormData(ev.currentTarget));
 const err=$('#labelError');
 if(labelMode==='nf'&&labelEl){labelEl.nf=Object.fromEntries(Object.entries(data).map(([k,v])=>[k,String(v).trim()]));}
 else if(labelMode==='barcode'){
   let b;try{b=M.barcode(data.format,data.digits);}catch(ex){err.textContent=ex.message;return;}
   if(labelEl){ labelEl.barType=data.format;labelEl.digits=b.d; }
   else {const panel='back', w=Math.min(2.45,(W()-2*(SEAL+SAFE))*.65), h=w*.68; if(view!==panel)setView(panel);addEl({type:'barcode',barType:data.format,digits:b.d,panel,w,h,x:W()/2,y:freeY(panel,h)});}
 }
 labelDialog.close();syncAll();commit();toast('Label updated');
});
let drawingPdf=false;
async function makeProof(){
 await fontsAll(); const background=S.bg||(S.film==='white'?'#ffffff':'#eef3f7');
 const flatten=panel=>{const art=panelCanvas(panel,170,false),c=document.createElement('canvas');c.width=art.width;c.height=art.height;const x=c.getContext('2d');x.fillStyle=background;x.fillRect(0,0,c.width,c.height);x.drawImage(art,0,0);return c;};
 const im=document.querySelector('.brand img'); if(!im.complete)await im.decode().catch(()=>{});const logo=document.createElement('canvas');logo.width=900;logo.height=Math.max(1,Math.round(900*im.naturalHeight/im.naturalWidth)||180);const g=logo.getContext('2d');g.fillStyle='white';g.fillRect(0,0,logo.width,logo.height);if(im.complete&&im.naturalWidth)g.drawImage(im,0,0,logo.width,logo.height);
 const z=zones();return M.proofPdf({type:S.type,size:{...S.size},film:S.film,front:flatten('front'),back:flatten('back'),logo,wicketLip:WICKET_LIP,wicketHoleX:holeOffset(),zone:{seal:SEAL,trim:TRIM,margin:SAFE,...z},plan:M.inkPlan(S),warnings:S.els.reduce((n,e)=>n+issues(e).length,0)});
}
async function downloadReviewPdf(){const b=await makeProof();const url=URL.createObjectURL(b);dl(url,`Metro-${wicket()?'Wicketed-':''}Dieline-Proof-${W()}x${G()}x${L()}in.pdf`);setTimeout(()=>URL.revokeObjectURL(url),20000);}
$('#dielineBtn').addEventListener('click',async()=>{if(drawingPdf)return;const el=$('#dielineBtn');drawingPdf=true;el.disabled=true;el.textContent='Preparing PDF…';
 try{await downloadReviewPdf();toast('Review PDF downloaded');}
 catch(e){console.error(e);toast('Couldn’t make that PDF. Please try again.');}
 finally{el.disabled=false;el.textContent='Download PDF';}
});

/* ---------- quote (PREVIEW: nothing is sent) ---------- */
const PREVIEW_ONLY = document.body.dataset.release !== 'live';
const LIVE_QUOTE_URL = 'https://metropack.com/quote';
const qd = $('#quote'); let qBodyHtml = null;
const CLIP = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/></svg>';
async function openQuote() {
  if (!PREVIEW_ONLY) {
    $('#qTitle').textContent='Request a quote';
    $('#qBody').innerHTML=`<div class="qdone"><p><b>${esc(bagName())} · ${fmt(W())} × ${fmt(G())} × ${fmt(L())}″</b></p><p>Download your review PDF, then attach it to Metro’s quote form under “Upload your artwork.” The PDF shows your design and measurements. It’s not a production file.</p><p>Your artwork stays on this device until you choose to submit it.</p><p role="status" id="quoteProofStatus" aria-live="polite"></p></div>`;
    const foot=$('#qFoot');foot.hidden=false;foot.innerHTML=`<button class="btn line" type="button" id="quotePdf">Download review PDF</button><a href="${LIVE_QUOTE_URL}" target="_blank" rel="noopener" class="btn primary" id="metroQuoteLink">Open quote form ↗</a>`;
    $('#quotePdf').onclick=async()=>{const btn=$('#quotePdf'),status=$('#quoteProofStatus');if(btn.disabled)return;btn.disabled=true;status.textContent='Preparing your PDF…';try{await downloadReviewPdf();status.textContent='PDF downloaded. Add it in the quote form.';}catch{status.textContent='Couldn’t make the PDF. Please try again.';}finally{btn.disabled=false;}};
    qd.showModal();return;
  }
  if (qBodyHtml) { $('#qBody').innerHTML = qBodyHtml; $('#qFoot').hidden = false; qBodyHtml = null; }
  const p = await buildPackage(); const n = inks().length; const thumb = panelCanvas('front', 40, true); const t = document.createElement('canvas'); const k = 150 / thumb.height; t.width = Math.round(thumb.width * k); t.height = 150; const tx = t.getContext('2d'); tx.fillStyle = S.film === 'clear' && !S.bg ? '#eef3f7' : '#fff'; tx.fillRect(0, 0, t.width, t.height); tx.drawImage(thumb, 0, 0, t.width, t.height);
  $('#qSum').innerHTML = `<img src="${t.toDataURL('image/png')}" alt="Your design"><div><b>Bottom gusset bread bag</b>${fmt(W())} × ${fmt(G())} × ${fmt(L())}″ (width × gusset × length)<br>${S.film === 'clear' ? 'Clear' : 'White'} film · ${n} listed ink${n === 1 ? '' : 's'}</div>`;
  $('#qAtt').innerHTML = `<span class="lbl" style="width:100%;margin:0">Attached to your request</span><a href="${p.pngUrl}" download="${p.pngName}">${CLIP}${p.pngName} · ${kb(p.png.size)}</a><a href="${p.jsonUrl}" download="${p.jsonName}">${CLIP}${p.jsonName} · ${kb(p.json.size)}</a>`;
  $('#qErr').textContent = '';
  if (qd.showModal) qd.showModal(); else qd.setAttribute('open', '');
}
$('#quoteBtn').addEventListener('click', openQuote);
$('#qClose').addEventListener('click', () => qd.close());
qd.addEventListener('click', (ev) => { if (ev.target === qd) qd.close(); });
$('#qForm').addEventListener('submit', (ev) => {
  ev.preventDefault(); if(!PREVIEW_ONLY)return; const f = ev.target; let bad = null;
  $$('input[required],select[required]', f).forEach((i) => { const ok = i.value.trim() && (i.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value.trim())); i.classList.toggle('bad', !ok); if (!ok && !bad) bad = i; });
  if (bad) { $('#qErr').textContent = 'Please fill in the boxes marked in red.'; bad.focus(); return; }
  const q = Object.fromEntries(new FormData(f).entries());
  const request = { ...q, product:bagName(), bagSize: `${fmt(W())} × ${fmt(G())} × ${fmt(L())}″ (W × G × L)`, printColors: String(inks().length), attachments: [pkg.pngName, pkg.jsonName], layout: layoutJson() };
  window.__lastQuote = request; // what the live version would hand to the metropack.com quote flow
  if (PREVIEW_ONLY) {
    qBodyHtml = $('#qBody').innerHTML;
    $('#qBody').innerHTML = `<div class="qdone"><span class="badge">Preview: not sent</span><h3>This is where it would go to our sales team</h3><p>On the live site, this request goes into the metropack.com quote form with your design attached:<br><b>${esc(pkg.pngName)}</b> and <b>${esc(pkg.jsonName)}</b>.</p><p>In this preview nothing was sent. You can keep your files:</p><p><a class="btn sm line" href="${pkg.pngUrl}" download="${pkg.pngName}">Design PNG</a> <a class="btn sm line" href="${pkg.jsonUrl}" download="${pkg.jsonName}">Layout file</a></p><p class="note">Want a real quote today? Call 1-800-642-0165 or email Sales@metropack.com.</p></div>`;
    $('#qFoot').hidden = true;
  }
});

/* ---------- save on this device ---------- */
function save() { try { const imgs = {}; for (const e of S.els) if (e.type === 'image' && IMGS[e.img]) imgs[e.img] = { name: IMGS[e.img].name, url: IMGS[e.img].url }; localStorage.setItem(draftKey, JSON.stringify({ s: JSON.parse(snap()), imgs })); } catch (e) { /* storage full: fine */ } }
async function loadSaved() {
  try {
    const raw = localStorage.getItem(draftKey); if (!raw) return false; const o = JSON.parse(raw);
    await Promise.all(Object.entries(o.imgs || {}).map(([id, r]) => new Promise((res) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); registerImage(id, c, r.name); res(); }; im.onerror = res; im.src = r.url; })));
    Object.assign(S, o.s); S.els = S.els.filter((e) => e.type !== 'image' || IMGS[e.img]); last = snap(); return true;
  } catch (e) { return false; }
}
let toastT = 0; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }

/* ---------- native creative tools ---------- */
const sd=$('#starterDialog'), opts=$('#starterOptions');
const iconFor={window:'<path d="M4 12h48v55H42V49a14 14 0 0 0-28 0v18H4z" fill="#2c193f"/><path d="M12 25h32v3H12zm6 8h20v3H18zM4 71h48v7H4z" fill="#f6d969"/>',seal:'<circle cx="28" cy="39" r="22" fill="#214a3e"/><path d="M19 35h18v4H19zm4 8h10v4H23zM8 68h40v4H8z" fill="#f6ebd4"/>',type:'<path d="M7 26h42v12H7z" fill="#cfecff"/><path d="M11 43h34v5H11zM15 52h26v5H15zM9 64h38v2H9z" fill="#233b87"/>'};
opts.insertAdjacentHTML('beforeend',Object.entries(C.styles).map(([k,v])=>`<label class="starter-tile"><input type="radio" name="style" value="${k}"${k==='window'?' checked':''}><span class="style-icon"><svg viewBox="0 0 56 86" aria-hidden="true"><rect x="2" y="1" width="52" height="84" rx="2" fill="#fff" stroke="#878692"/><path d="M2 9h52" stroke="#c3c1c9"/>${iconFor[k]}</svg></span><span>${v.name}</span></label>`).join(''));
$('#palettePick').innerHTML=Object.entries(C.palettes).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('');
function syncCreative(){
 const row=$('#paletteRow'), layer=$('#layers');row.hidden=!S.starter||!S.els.some(e=>e.starterColor);
 if(S.starter)$('#palettePick').value=S.starter.palette;
 layer.innerHTML=S.els.filter(e=>view==='whole'||e.panel===view).slice().reverse().map(e=>`<button type="button" aria-pressed="${e.id===sel}" data-layer="${e.id}">${view==='whole'?`${e.panel==='front'?'Front':'Back'} · `:''}${esc(e.type==='shape'?shapeName(e):ELNAME(e))}</button>`).join('');
}
// A single, browsable picker lists every on-site shape, not only the shortcuts.
const shapeGroups=[
 ['Windows & frames',['oven','ovenTrim','arch','frame','ovalFrame']],
 ['Basics',['rectangle','round','oval','triangle','diamond','star','line','arrow','hexagon','pill']],
 ['Bakery marks',['loaf','wheat','ray','leaf','sparkle','seal']],
 ['Bands & badges',['ribbon','shield','burst','tie']]
];
const shapeAlias={oven:'arch window opening',ovenTrim:'arch window border frame outline',frame:'box border outline',ovalFrame:'ring circle border outline',oval:'oval round circle',pill:'pill rounded label',wheat:'grain stalk',ray:'sun',loaf:'bread',ribbon:'banner',tie:'band stripe strip'};
const shapeLibrary=$('#shapeLibrary'), shapeSearch=$('#shapeSearch'), shapeSections=$('#shapeSections'), shapeScroll=$('#shapeScroll');
const tieGraphic=['Tie stripe','M2 39H98V61H2Z M2 26H98V31H2Z M2 69H98V74H2Z'];
function renderShapeLibrary(){
 const terms=shapeSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let total=0;
 shapeSections.innerHTML=shapeGroups.map(([group,keys],i)=>{
  const tiles=keys.map(key=>{
   if(key==='tie'&&wicket())return '';
   const [name,path]=key==='tie'?tieGraphic:M.SHAPES[key];
   if(!terms.every(t=>(name+' '+group+' '+(shapeAlias[key]||'')).toLowerCase().includes(t)))return '';
   total++;return `<button type="button" class="shape-tile" data-shape-key="${key}"><svg viewBox="-4 -4 108 108" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${path}"/></svg><span>${M.E(name)}</span></button>`;
  }).join('');return tiles?`<section aria-labelledby="shapeGroup${i}"><h3 id="shapeGroup${i}">${M.E(group)}</h3><div class="shape-grid">${tiles}</div></section>`:'';
 }).join('');
 $('#shapeEmpty').hidden=total!==0;$('#shapeCount').textContent=`${total} ${total===1?'shape':'shapes'}`;shapeScroll.scrollTop=0;
}
$('#openMarks').addEventListener('click',()=>{shapeSearch.value='';renderShapeLibrary();shapeLibrary.showModal();$('#shapeLibraryTitle').focus({preventScroll:true});});
$('#shapeClose').addEventListener('click',()=>shapeLibrary.close());
shapeLibrary.addEventListener('click',e=>{if(e.target!==shapeLibrary)return;const r=shapeLibrary.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)shapeLibrary.close();});
shapeSearch.addEventListener('input',renderShapeLibrary);
shapeSections.addEventListener('click',e=>{const tile=e.target.closest('[data-shape-key]');if(!tile)return;const key=tile.dataset.shapeKey;shapeLibrary.close();if(key==='tie')addBand();else addShape(key);});
function selectLayer(id){const item=S.els.find(e=>e.id===id);if(!item)return;sel=id;if(view!==item.panel)setView(item.panel);syncAll();}
$('#layers').addEventListener('click',e=>{const b=e.target.closest('[data-layer]');if(b)selectLayer(b.dataset.layer);});
$('.layer-actions').addEventListener('click',e=>{const k=e.target.closest('[data-layer-action]')?.dataset.layerAction, item=curEl();if(!k||!item)return;
 const ix=S.els.indexOf(item);if(k==='duplicate'){const clone=JSON.parse(JSON.stringify(item));clone.x=clamp(item.x+.15,SEAL+SAFE,W()-SEAL-SAFE);clone.y=Math.min(item.y+.15,L()-.2);addEl(clone);return;}
 const sign=k==='up'?1:-1;for(let i=ix+sign;i>=0&&i<S.els.length;i+=sign){if(S.els[i].panel===item.panel){[S.els[i],S.els[ix]]=[S.els[ix],S.els[i]];syncAll();commit();return;}}
});
$('#bagKind').addEventListener('change',e=>{S.type=e.target.value;syncAll();commit();});
$('#chooseStarter').addEventListener('click',()=>{const v=S.starter;if(v){$('#starterBrand').value=v.brand;$('#starterProduct').value=v.product;const a=opts.querySelector(`input[value="${v.style}"]`);if(a)a.checked=true;}$('#starterNotice').hidden=!S.els.some(e=>!e.kind&&!['nf','barcode'].includes(e.type));sd.showModal();});
$('#starterClose').addEventListener('click',()=>sd.close());
$('#starterForm').addEventListener('submit',async ev=>{
 ev.preventDefault();const btn=$('#applyStarter');if(btn.disabled)return;btn.disabled=true;
 try{
  const fd=new FormData(ev.currentTarget),style=String(fd.get('style')),brand=String(fd.get('brand')).trim(),product=String(fd.get('product')).trim();if(!brand||!product){toast('Enter both names');return;}
  const palette=S.starter?.style===style?S.starter.palette:C.styles[style].palette, z=zones();
  const art=C.build({style,palette,brand,product,w:W(),l:L(),top:wicket()?z.safe.y0+.04:Math.max(z.twist+.16,z.safe.y0+.04),bottom:L()-.37});
  await Promise.all([...new Set(art.filter(e=>e.type==='text').map(e=>e.font))].map(ensureFont));
  for(const e of art){e.id=uid();if(e.type==='text'){const d=textBox(e);if(d.w>e.starterMax)e.size*=e.starterMax/d.w;}}
  const labels=S.els.filter(e=>e.kind||['nf','barcode'].includes(e.type));S.els=[...art,...labels];S.bg=null;S.starter={style,palette,brand,product};
  sel=null;setView('front');syncAll();commit();sd.close();toast('Style added');
 }catch(err){console.error(err);toast('Couldn’t add that style. Please try again.');}finally{btn.disabled=false;}
});
$('#palettePick').addEventListener('change',e=>{if(!S.starter||!C.palettes[e.target.value])return;S.starter.palette=e.target.value;C.recolor(S.els,e.target.value);syncAll();commit();});

/* ---------- go ---------- */
window.__designer = { S, IMGS, setView, addText, addBand, addPlaceholder, issues, inks, layoutJson, buildPackage, makeProof, open3d, loadFile, registerImage, addEl, syncAll, commit, get sel() { return sel; }, set sel(v) { sel = v; } };
(async () => {
  const params = new URLSearchParams(location.search);
  const saved=!params.has('fresh')&&await loadSaved();
  if(example&&!saved){
    const raw=C.sample();await Promise.all([...new Set(raw.filter(e=>e.type==='text').map(e=>e.font))].map(ensureFont));
    S.type='wicket';S.starter={style:'window',palette:'plum',brand:'Late Riser',product:'The Everyday Loaf'};
    for(const e of raw){e.id=uid();if(e.type==='text'&&e.starterMax){const d=textBox(e);if(d.w>e.starterMax)e.size*=e.starterMax/d.w;}}
    S.els=raw;last=snap();
  }
  if(example)$('#bagIntro').textContent='Late Riser · editable sample';
  if(!['bread','wicket'].includes(S.type))S.type='bread';
  $('#declared').value=S.declared||'';setView(view); syncAll(); syncUndo();
  Promise.all(FONTS.map((f) => ensureFont(f.id))).then(() => syncAll());
})();
})();
