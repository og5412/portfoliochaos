(() => {
  const player = document.querySelector('[data-mechanism-player]');
  if (!player) return;
  const tabs = Array.from(player.querySelectorAll('[data-mechanism-stage]'));
  const panels = Array.from(player.querySelectorAll('[data-mechanism-panel]'));
  const back = player.querySelector('[data-mechanism-back]');
  const next = player.querySelector('[data-mechanism-next]');
  const status = player.querySelector('[data-mechanism-status]');
  const labels = ['Clean', 'Emerge', 'Capture', 'Scars'];
  let selected = 0;

  function select(index, focusTab = false) {
    if (index < 0 || index >= tabs.length) return;
    selected = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    back.disabled = index === 0;
    next.disabled = index === tabs.length - 1;
    status.textContent = `Step ${index + 1} of ${tabs.length} · ${labels[index]}`;
    if (focusTab) tabs[index].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); select(target, true); }
    });
  });
  back.addEventListener('click', () => select(selected - 1));
  next.addEventListener('click', () => select(selected + 1));
  select(0);
  player.dataset.ready = 'true';
})();
