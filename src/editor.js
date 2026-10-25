// A dependency-free editor. Exported websites contain the chosen configuration and local media.
const original = structuredClone(window.INVITATION);
let state = structuredClone(original);
const $ = id => document.getElementById(id);
const form = $('form');
let statusTimer;

function notify(message) {
  $('status').textContent = message;
  $('status').classList.add('visible');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => $('status').classList.remove('visible'), 6000);
}
const get = path => path.split('.').reduce((o, k) => o?.[k], state);

function set(path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((o, k) => o[k], state)[last] = value;
}

function element(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key === 'className') el.className = value;
    else if (key in el) el[key] = value;
    else el.setAttribute(key, value);
  }
  el.append(...children);
  return el;
}

function field(label, path, {
  type = 'text',
  hint = '',
  multiline = false
} = {}) {
  const input = element(multiline ? 'textarea' : 'input', {
    ...(multiline ? {} : {type}),
    value: get(path) ?? '',
    name: path,
    oninput: event => {
      set(path, type === 'checkbox' ? event.target.checked : event.target.value);
      if (path === 'dateTime' || path === 'displayTimeZone') updateDate();
    },
  });
  if (type === 'checkbox') input.checked = !!get(path);
  const wrap = element('label', {
    className: 'field'
  }, element('span', {}, label), input);
  if (hint) wrap.append(element('small', {}, hint));
  return wrap;
}

function row(...children) {
  return element('div', {
    className: 'two'
  }, ...children);
}

function section(title, note = '') {
  const content = element('div');
  const details = element('details', {}, element('summary', {}, title), content);
  if (note) content.append(element('p', {
    className: 'section-note'
  }, note));
  form.append(details);
  return {
    details,
    content
  };
}

function upload(label, path, accept) {
  return element('label', {
    className: 'upload'
  }, element('span', {}, label), element('input', {
    type: 'file',
    accept,
    onchange: async event => {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 35 * 1024 * 1024) {
        notify('Choose a file smaller than 35 MB.');
        return;
      }
      try {
        const data = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        set(path, data);
        const text = form.elements.namedItem(path);
        if (text) text.value = data;
        notify(file.name + ' added. Update preview to see your changes.');
      } catch {
        notify('That file could not be read. Please try again.');
      }
    }
  }));
}

function mediaField(label, path, accept, hint) {
  return element('div', {}, field(label, path, {
    hint
  }), upload('Or upload a replacement', path, accept));
}

function updateDate() {
  try {
    const d = new Date(state.dateTime);
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: state.displayTimeZone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).formatToParts(d).map(x => [x.type, x.value]));
    state.dateLabel = `${p.weekday}, ${p.day} ${p.month}, ${p.year}`;
    const input = form.elements.namedItem('dateLabel');
    if (input) input.value = state.dateLabel;
  } catch {}
}

function render() {
  const open = [...form.querySelectorAll('details')].map(x => x.open);
  form.replaceChildren();
  let {
    details,
    content
  } = section('01  The couple');
  details.open = true;
  content.append(row(field('First name', 'bride'), field('Second name', 'groom')), field('First family', 'brideParents'), field('First relation', 'brideRelation'), field('Second family', 'groomParents'), field('Second relation', 'groomRelation'), field('Monogram initials', 'media.initials', {
    hint: 'Two letters. A custom monogram image can be added under Media.'
  }));
  ({
    content
  } = section('02  Date & invitation', 'The countdown uses the exact time and UTC offset below. Edit event dates separately under Wedding events.'));
  content.append(field('Wedding date and time, with UTC offset', 'dateTime', {
    hint: 'Example: 2027-02-14T18:00:00+05:30 for 6 PM in India.'
  }), field('Display time zone', 'displayTimeZone', {
    hint: 'Use an IANA zone, such as Asia/Kolkata.'
  }), field('Date revealed inside the heart', 'dateLabel'), field('Prayer / blessing', 'prayer'), field('Prayer, line 1', 'prayerLines.0'), field('Prayer, line 2', 'prayerLines.1'), field('Invitation heading', 'inviteTitle'), ...state.invitationLines.map((_, i) => field('Invitation, line ' + (i + 1), 'invitationLines.' + i)));
  ({
    content
  } = section('03  Your photographs', 'Images use the same framed carousel as the reference. Upload your photos or enter relative file paths.'));
  state.gallery.forEach((_, i) => {
    const card = element('div', {
      className: 'subcard'
    }, element('h3', {}, 'Photo ' + (i + 1), element('button', {
      type: 'button',
      className: 'remove',
      onclick: () => {
        if (state.gallery.length === 1) {
          notify('Keep at least one photograph.');
          return;
        }
        state.gallery.splice(i, 1);
        render();
      }
    }, 'Remove')), mediaField('Image path', 'gallery.' + i, 'image/*', 'Example: media/our-photo.jpg'));
    content.append(card);
  });
  content.append(element('button', {
    type: 'button',
    className: 'add',
    onclick: () => {
      state.gallery.push(state.gallery[0]);
      render();
    }
  }, '+ Add photograph'));
  ({
    content
  } = section('04  Your story'));
  content.append(field('Story heading', 'storyTitle'), ...state.storyParagraphs.map((_, i) => field('Paragraph ' + (i + 1), 'storyParagraphs.' + i, {
    multiline: true
  })));
  ({
    content
  } = section('05  Wedding events', 'Each card has its own date, time, image and map link. Map links should point to your actual venue.'));
  content.append(field('Section heading', 'eventsTitle'));
  state.events.forEach((event, i) => {
    const prefix = 'events.' + i + '.';
    content.append(element('div', {
        className: 'subcard'
      }, element('h3', {}, 'Event ' + (i + 1), element('button', {
        type: 'button',
        className: 'remove',
        onclick: () => {
          if (state.events.length === 1) {
            notify('Keep at least one event.');
            return;
          }
          state.events.splice(i, 1);
          render();
        }
      }, 'Remove')),
      field('Event name', prefix + 'title'), field('Displayed date', prefix + 'date'), field('Time / schedule', prefix + 'time', {
        multiline: true
      }), field('Venue', prefix + 'venue'), field('Address', prefix + 'address', {
        multiline: true
      }), field('Google Maps link', prefix + 'url', {
        hint: 'Paste the full https:// link.'
      }), field('Additional note', prefix + 'note'), field('Use wedding date / time styling', prefix + 'featured', {
        type: 'checkbox'
      }), mediaField('Event artwork', prefix + 'image', 'image/*')
    ));
  });
  content.append(element('button', {
    type: 'button',
    className: 'add',
    onclick: () => {
      state.events.push({
        ...state.events[0],
        title: 'New event',
        date: '',
        time: '',
        featured: false,
        note: ''
      });
      render();
    }
  }, '+ Add event'));
  ({
    content
  } = section('06  Family & blessings'));
  content.append(field('Section heading', 'familyTitle'));
  state.family.forEach((_, i) => content.append(element('div', {
    className: 'subcard'
  }, element('h3', {}, 'Family group ' + (i + 1), element('button', {
    type: 'button',
    className: 'remove',
    onclick: () => {
      state.family.splice(i, 1);
      render();
    }
  }, 'Remove')), field('Relationship', 'family.' + i + '.label'), field('Names', 'family.' + i + '.names', {
    multiline: true
  }), field('Highlight this group and show the family quote', 'family.' + i + '.highlight', {
    type: 'checkbox'
  }))));
  content.append(element('button', {
    type: 'button',
    className: 'add',
    onclick: () => {
      state.family.push({
        label: 'Family',
        names: ''
      });
      render();
    }
  }, '+ Add family group'), field('Family quote', 'familyQuote', {
    multiline: true
  }));
  ({
    content
  } = section('07  Video, music & artwork', 'The palace and ribbon animation are in the video file. Text embedded inside photos or videos must be edited in those files. Music starts after the guest opens the invitation, subject to browser settings.'));
  content.append(mediaField('Opening video', 'media.heroVideo', 'video/mp4', 'Use an MP4 compatible with your guests’ phones.'), mediaField('Opening poster / cover image', 'media.poster', 'image/*'), mediaField('Background music', 'media.music', 'audio/*'), mediaField('Custom monogram (optional)', 'media.monogram', 'image/*', 'Leave blank to generate the floral initials automatically.'), mediaField('Music button artwork', 'media.record', 'image/*'));
  ({
    content
  } = section('08  Words & colours'));
  for (const [label, path] of [
      ['Loading message', 'loadingText'],
      ['Opening instruction', 'tapText'],
      ['Between the names', 'wedsText'],
      ['Between the families', 'withText'],
      ['Scroll instruction', 'scrollText'],
      ['Scratch heading', 'scratchTitle'],
      ['Scratch instruction', 'scratchSubtitle'],
      ['Scratch hint', 'scratchHint'],
      ['Countdown heading', 'countdownTitle'],
      ['Thank you', 'thankYou'],
      ['Footer credit', 'credit']
    ]) content.append(field(label, path));
  content.append(row(field('Burgundy / headings', 'theme.primary', {
    type: 'color'
  }), field('Gold / accents', 'theme.accent', {
    type: 'color'
  })), row(field('Background', 'theme.background', {
    type: 'color'
  }), field('Body text', 'theme.text', {
    type: 'color'
  })));
  ({
    content
  } = section('09  Link sharing & backups', 'The downloaded ZIP includes updated share-preview metadata. Upload the exported files to your host, then share that public URL. WhatsApp can cache old link previews.'));
  content.append(field('Share-preview title', 'sharing.title'), field('Share-preview description', 'sharing.description', {
    multiline: true
  }), field('Public website URL (after hosting)', 'sharing.publicUrl', {
    hint: 'For example, https://your-invitation.example. Used for absolute preview-image URLs.'
  }), mediaField('Share-preview image', 'sharing.image', 'image/*', 'A 1200 × 630 image works well for link previews.'));
  if (open.length)[...form.querySelectorAll('details')].forEach((x, i) => x.open = open[i] ?? false);
}

function validate(s) {
  if (!s || typeof s !== 'object' || !s.media || !s.theme || !s.sharing) throw Error('Settings are missing required sections.');
  for (const key of ['bride', 'groom', 'dateTime', 'displayTimeZone', 'dateLabel'])
    if (typeof s[key] !== 'string' || !s[key].trim()) throw Error('Please complete ' + key + '.');
  if (!/T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(s.dateTime) || !Number.isFinite(Date.parse(s.dateTime))) throw Error('Use an ISO date and time including a UTC offset, such as 2027-02-14T18:00:00+05:30.');
  new Intl.DateTimeFormat('en', {
    timeZone: s.displayTimeZone
  });
  if (!Array.isArray(s.gallery) || !s.gallery.length || !Array.isArray(s.events) || !s.events.length || !Array.isArray(s.family)) throw Error('Keep at least one photograph and one event.');
  for (const [key, count] of [
      ['prayerLines', 2],
      ['invitationLines', 3],
      ['storyParagraphs', 4]
    ])
    if (!Array.isArray(s[key]) || s[key].length !== count) throw Error(key + ' must contain ' + count + ' entries.');
  for (const value of Object.values(s.theme))
    if (!/^#[a-f0-9]{6}$/i.test(value)) throw Error('Choose valid theme colours.');
  const safeMedia = v => typeof v === 'string' && (!v || /^(?:data:(?:image|video|audio)\/[a-z0-9.+-]+(?:;[^,]*)?,|https?:\/\/|(?:\.?\.?\/)?[a-z0-9_\-/])/i.test(v)) && !/^\/\//.test(v) && !/[<>]/.test(v);
  for (const value of [...s.gallery, ...s.events.map(e => e.image), ...Object.entries(s.media).filter(([k]) => k !== 'initials').map(([, v]) => v), s.sharing.image])
    if (!safeMedia(value)) throw Error('Use a local media path, uploaded file, or an http/https media URL.');
  for (const e of s.events) {
    const u = new URL(e.url);
    if (!/^https?:$/.test(u.protocol)) throw Error('Map links must start with https:// or http://.');
  }
  if (s.sharing.publicUrl) {
    const u = new URL(s.sharing.publicUrl);
    if (!/^https?:$/.test(u.protocol)) throw Error('The public website URL must use http or https.');
  }
}

let previewUrls = [];
let previewGeneration = 0;
async function preview() {
  const generation = ++previewGeneration;
  const urls = [];
  try {
    validate(state);
    const config = structuredClone(state);
    async function visit(node) {
      for (const [key, value] of Object.entries(node)) {
        if (value && typeof value === 'object') await visit(value);
        else if (typeof value === 'string' && value.startsWith('data:')) {
          const blob = await (await fetch(value)).blob();
          const url = URL.createObjectURL(blob); urls.push(url); node[key] = url;
        }
      }
    }
    await visit(config);
    if (generation !== previewGeneration) { urls.forEach(URL.revokeObjectURL); return; }
    sessionStorage.setItem('invitation-studio-preview', JSON.stringify(config));
    const old = previewUrls; previewUrls = urls;
    $('frame').src = 'index.html?editor-preview=1&t=' + Date.now();
    setTimeout(() => old.forEach(URL.revokeObjectURL), 1000);
  } catch (e) { urls.forEach(URL.revokeObjectURL); notify('Preview: ' + e.message); }
}

let preparedDownloadUrl = null;
function saveBlob(name, blob) {
  if (preparedDownloadUrl) URL.revokeObjectURL(preparedDownloadUrl);
  preparedDownloadUrl = URL.createObjectURL(blob);
  const area = $('download-area');
  area.hidden = false;
  const link = element('a', {href:preparedDownloadUrl,download:name,id:'download-ready'},
    name.endsWith('.zip') ? 'Save website ZIP ↓' : 'Save config.js ↓');
  const close = element('button', {type:'button','aria-label':'Close download',onclick:()=>{area.hidden=true;}}, '×');
  area.replaceChildren(link,close);
}

const configText = s => '// Your editable wedding invitation settings.\nwindow.INVITATION = ' + JSON.stringify(s, null, 2) + ';\n';
// Standard ZIP (stored entries): CRC-32, UTF-8 names, local headers, central directory, EOCD.
const encoder = new TextEncoder();
const crcTable = Uint32Array.from({
  length: 256
}, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});

function crc32(bytes) {
  let n = 0xffffffff;
  for (const b of bytes) n = crcTable[(n ^ b) & 255] ^ (n >>> 8);
  return (n ^ 0xffffffff) >>> 0;
}

function zip(entries) {
  const chunks = [],
    central = [];
  let offset = 0,
    centralSize = 0;
  for (const [path, data] of entries) {
    const name = encoder.encode(path),
      crc = crc32(data),
      header = new Uint8Array(30 + name.length),
      dv = new DataView(header.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0x800, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true);
    dv.setUint32(22, data.length, true);
    dv.setUint16(26, name.length, true);
    header.set(name, 30);
    chunks.push(header, data);
    const c = new Uint8Array(46 + name.length),
      cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    c.set(name, 46);
    central.push(c);
    centralSize += c.length;
    offset += header.length + data.length;
  }
  const end = new Uint8Array(22),
    v = new DataView(end.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, entries.length, true);
  v.setUint16(10, entries.length, true);
  v.setUint32(12, centralSize, true);
  v.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end], {
    type: 'application/zip'
  });
}

function materializeUploads(config) {
  const files = new Map();
  let id = 0;

  function visit(node) {
    for (const [key, value] of Object.entries(node)) {
      if (value && typeof value === 'object') visit(value);
      else if (typeof value === 'string' && value.startsWith('data:')) {
        const m = value.match(/^data:([^;,]+)(;base64)?,(.*)$/s);
        if (!m) throw Error('An uploaded file is malformed.');
        const extensions = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/svg+xml': 'svg',
          'image/gif': 'gif',
          'image/avif': 'avif',
          'video/mp4': 'mp4',
          'audio/mpeg': 'mp3',
          'audio/mp3': 'mp3',
          'audio/mp4': 'm4a',
          'audio/ogg': 'ogg',
          'audio/wav': 'wav',
          'video/webm': 'webm'
        };
        const path = 'media/upload-' + String(++id).padStart(3, '0') + '.' + (extensions[m[1]] || 'bin');
        const raw = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
        const bytes = m[2] ? Uint8Array.from(raw, c => c.charCodeAt(0)) : encoder.encode(raw);
        files.set(path, bytes);
        node[key] = path;
      }
    }
  }
  visit(config);
  return files;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } [c]));
}

function updateMeta(html, s) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.title = s.sharing.title;
  for (const tag of doc.querySelectorAll('meta[property],meta[name]')) {
    const key = tag.getAttribute('property') || tag.name;
    if (/^(og:|twitter:)/.test(key)) {
      if (/title|site_name/.test(key)) tag.content = s.sharing.title;
      else if (/description/.test(key)) tag.content = s.sharing.description;
      else if (/image$|image:secure_url$/.test(key)) tag.content = s.sharing.publicUrl ? new URL(s.sharing.image, s.sharing.publicUrl.replace(/\/?$/, '/')).href : s.sharing.image;
    }
  }
  const favicon = doc.querySelector('link[rel="icon"]');
  if (favicon) favicon.href = s.media.monogram || 'media/monogram-floral-gold-v11.svg';
  return '<!doctype html>\n' + doc.documentElement.outerHTML;
}
async function exportWebsite() {
  const button = $('export');
  try {
    validate(state);
    button.disabled = true;
    notify('Preparing your invitation and all media…');
    const config = structuredClone(state),
      uploaded = materializeUploads(config);
    const response = await fetch('files.json');
    if (!response.ok) throw Error('The file list could not be loaded.');
    const paths = await response.json();
    const configString = JSON.stringify(config);
    const kept = paths.filter(p => !(/^(media|videos)\//.test(p) && !configString.includes(p) && p !== 'media/monogram-floral-gold-v11.svg'));
    const entries = [];
    for (let i = 0; i < kept.length; i += 6) {
      const batch = await Promise.all(kept.slice(i, i + 6).filter(p => p !== 'config.js' && p !== 'config.example.json' && p !== 'files.json').map(async path => {
        const r = await fetch(path);
        if (!r.ok) throw Error('Could not read ' + path);
        let data = new Uint8Array(await r.arrayBuffer());
        if (path === 'index.html') data = encoder.encode(updateMeta(new TextDecoder().decode(data), config));
        return [path, data];
      }));
      entries.push(...batch);
    }
    entries.push(['config.js', encoder.encode(configText(config))], ['config.example.json', encoder.encode(JSON.stringify(config, null, 2))], ...uploaded);
    // Rebuild the manifest so this customized download can be edited and exported again.
    const names = [...entries.map(([p]) => p), 'files.json'].sort();
    entries.push(['files.json', encoder.encode(JSON.stringify(names, null, 2))]);
    saveBlob('wedding-invitation-customized.zip', zip(entries));
    notify('Your ZIP is ready. Click Save website ZIP, then extract it and follow START_HERE.md.');
  } catch (e) {
    notify('Download: ' + e.message);
  } finally {
    button.disabled = false;
  }
}
form.addEventListener('submit', e => e.preventDefault());
$('preview').addEventListener('click', preview);
$('export').addEventListener('click', exportWebsite);
$('config').addEventListener('click', () => {
  try {
    validate(state);
    saveBlob('config.js', new Blob([configText(state)], {
      type: 'text/javascript'
    }));
    notify('Click Save config.js. Replace the old file with your download, then re-upload the site.');
  } catch (e) {
    notify(e.message);
  }
});
$('reset').addEventListener('click', () => {
  state = structuredClone(original);
  render();
  preview();
  notify('Restored the saved invitation.');
});
$('import').addEventListener('change', async event => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    let text = await file.text();
    if (text.includes('window.INVITATION')) text = text.slice(text.indexOf('=', text.indexOf('window.INVITATION')) + 1).trim().replace(/;\s*$/, '');
    const parsed = JSON.parse(text);
    validate(parsed);
    state = parsed;
    render();
    preview();
    notify('Settings imported.');
  } catch (e) {
    notify('Import: ' + e.message);
  } finally {
    event.target.value = '';
  }
});
for (const mode of ['mobile', 'desktop']) $(mode).addEventListener('click', () => {
  $('frame-shell').className = mode === 'mobile' ? 'phone' : 'wide';
  for (const key of ['mobile', 'desktop']) {
    $(key).classList.toggle('active', key === mode);
    $(key).setAttribute('aria-pressed', String(key === mode));
  }
});
render();
preview();
