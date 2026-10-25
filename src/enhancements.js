import {
  invitation
} from './settings.js';
// Keep the reference appearance while adding keyboard controls and reliable gesture-started audio.
const observer = new MutationObserver(enhance);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

function enhance() {
  const hero = document.querySelector('._hero_11gmz_1');
  if (hero && !hero.dataset.accessible) {
    hero.dataset.accessible = 'true';
    const overlay = hero.querySelector('._overlay_11gmz_38');
    overlay.setAttribute('role', 'button');
    overlay.setAttribute('tabindex', '0');
    overlay.setAttribute('aria-label', 'Open wedding invitation');
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        overlay.click();
      }
    });
    hero.addEventListener('click', () => {
      const audio = document.querySelector('audio');
      if (!audio || window.__invitationAudioStarted) return;
      audio.volume = .5;
      audio.play().then(() => {
        window.__invitationAudioStarted = true;
      }).catch(() => {});
    }, {
      capture: true,
      once: true
    });
  }
  const canvas = document.querySelector('._scratchCanvas_ryx1z_167');
  if (canvas && !canvas.dataset.accessible) {
    canvas.dataset.accessible = 'true';
    canvas.setAttribute('role', 'button');
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('aria-label', 'Scratch to reveal wedding date, or press Enter');
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        canvas.dispatchEvent(new Event('invitation-reveal'));
        canvas.setAttribute('aria-label', invitation.dateLabel);
      }
    });
  }
  const audio = document.querySelector('audio');
  const music = document.querySelector('._player_1m9ai_5');
  if (music && audio && !music.dataset.accessible) {
    music.dataset.accessible = 'true';
    const update = () => {
      music.setAttribute('aria-label', audio.paused ? 'Play music' : 'Pause music');
      music.setAttribute('aria-pressed', String(!audio.paused));
    };
    audio.addEventListener('play', update);
    audio.addEventListener('pause', update);
    update();
  }
}
enhance();
