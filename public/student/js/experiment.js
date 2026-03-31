let currentSimUrl = '';

async function loadExperiments() {
  const simButtons = document.getElementById('simButtons');
  const simTitle = document.getElementById('simTitle');
  const simFrame = document.getElementById('simFrame');

  simButtons.innerHTML = '<p>Уншиж байна...</p>';

  try {
    const res = await fetch('/api/experiments');
    const data = await res.json();

    if (!data.success || data.experiments.length === 0) {
      simButtons.innerHTML = '<p>Одоогоор туршилт алга байна.</p>';
      simFrame.src = '';
      return;
    }

    simButtons.innerHTML = '';

    data.experiments.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.className = 'sim-btn';
      btn.textContent = item.title;
      btn.onclick = () => loadSim(item.url, item.title);
      simButtons.appendChild(btn);

      if (index === 0) {
        currentSimUrl = item.url;
        simTitle.textContent = item.title;
        simFrame.src = item.url;
      }
    });
  } catch (error) {
    console.error('loadExperiments error:', error);
    simButtons.innerHTML = '<p>Серверийн алдаа гарлаа.</p>';
  }
}

function loadSim(url, title) {
  currentSimUrl = url;
  document.getElementById('simFrame').src = url;
  document.getElementById('simTitle').textContent = title || 'Физикийн туршилтын цонх';
}

function openCurrentSim() {
  if (!currentSimUrl) return;
  window.open(currentSimUrl, '_blank');
}

window.addEventListener('DOMContentLoaded', loadExperiments);