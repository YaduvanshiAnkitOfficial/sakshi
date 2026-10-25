// One configuration shared by every invitation section.
const defaults = window.INVITATION;
let edited = null;
if (new URLSearchParams(location.search).get("editor-preview") === "1") {
  try {
    edited = JSON.parse(sessionStorage.getItem("invitation-studio-preview"));
  } catch {}
}
export const invitation = edited || defaults;
const W = invitation;
// Generate the floral monogram from editable initials when no custom SVG/image is supplied.
const escapeXML = text => String(text).replace(/[<>&"']/g, c => ({
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&apos;"
} [c]));
const letters = Array.from(W.media.initials || (W.bride[0] + W.groom[0]));
const template = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"45 45 410 410\" role=\"img\" aria-label=\"A and M wedding monogram\"><g color=\"#b48c46\" fill=\"#b48c46\" stroke=\"#b48c46\"><circle cx=\"250\" cy=\"250\" r=\"181\" fill=\"none\" stroke-width=\"1.4\"/><path d=\"M142 92 A188 188 0 0 1 433 292 M359 411 A188 188 0 0 1 67 208\" fill=\"none\" stroke-width=\".8\"/><g transform=\"translate(118 333) rotate(-45)\" fill=\"currentColor\" opacity=\".8\"><path d=\"M0 0 Q-19 -17 -17 -32 Q1 -26 0 0 M0 0 Q19 -17 17 -32 Q-1 -26 0 0\"/></g><g transform=\"translate(135 366) rotate(-65)\" fill=\"currentColor\" opacity=\".8\"><path d=\"M0 0 Q-19 -17 -17 -32 Q1 -26 0 0 M0 0 Q19 -17 17 -32 Q-1 -26 0 0\"/></g><g transform=\"translate(167 393) rotate(-85)\" fill=\"currentColor\" opacity=\".8\"><path d=\"M0 0 Q-19 -17 -17 -32 Q1 -26 0 0 M0 0 Q19 -17 17 -32 Q-1 -26 0 0\"/></g><g transform=\"translate(370 166) rotate(140)\" fill=\"currentColor\" opacity=\".8\"><path d=\"M0 0 Q-19 -17 -17 -32 Q1 -26 0 0 M0 0 Q19 -17 17 -32 Q-1 -26 0 0\"/></g><g transform=\"translate(350 134) rotate(120)\" fill=\"currentColor\" opacity=\".8\"><path d=\"M0 0 Q-19 -17 -17 -32 Q1 -26 0 0 M0 0 Q19 -17 17 -32 Q-1 -26 0 0\"/></g><g transform=\"translate(315 112) rotate(100)\" fill=\"currentColor\" opacity=\".8\"><path d=\"M0 0 Q-19 -17 -17 -32 Q1 -26 0 0 M0 0 Q19 -17 17 -32 Q-1 -26 0 0\"/></g><g stroke=\"none\" font-family=\"Georgia,serif\" text-anchor=\"middle\"><text x=\"214\" y=\"277\" font-size=\"167\">A</text><text x=\"298\" y=\"333\" font-size=\"137\">M</text></g></g></svg>";
const svg = template.replace('>A</text>', '>' + escapeXML(letters[0] || "") + '</text>')
  .replace('>M</text>', '>' + escapeXML(letters[1] || "") + '</text>')
  .replace('A and M wedding monogram', escapeXML(W.bride + ' and ' + W.groom + ' wedding monogram'));
W.monogram = W.media.monogram || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
for (const [name, value] of Object.entries(W.theme)) {
  if (/^#[0-9a-f]{6}$/i.test(value)) document.documentElement.style.setProperty('--color-' + ({
    background: 'secondary'
  } [name] || name), value);
}
document.documentElement.style.setProperty('--color-bg-gradient', `linear-gradient(135deg, ${W.theme.background} 0%, #f5efe0 100%)`);
document.title = W.sharing.title;
for (const prop of ['og:title', 'og:description', 'og:site_name', 'twitter:title', 'twitter:description']) {
  const node = document.querySelector(`[property="${prop}"],[name="${prop}"]`);
  if (node) node.content = /description/.test(prop) ? W.sharing.description : W.sharing.title;
}
export function formatDateLabel(iso) {
  const date = new Date(iso);
  const options = {
    timeZone: W.displayTimeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', options).formatToParts(date).map(p => [p.type, p.value]));
  return `${parts.weekday}, ${parts.day} ${parts.month}, ${parts.year}`;
}
