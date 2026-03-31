let currentSimUrl = '';
let editingExperimentId = null;

async function loadExperiments() {
  const simButtons = document.getElementById('simButtons');
  const simTitle = document.getElementById('simTitle');
  const simFrame = document.getElementById('simFrame');
  const editorList = document.getElementById('experimentEditorList');

  simButtons.innerHTML = '<p class="sidebar-loading">Уншиж байна...</p>';
  editorList.innerHTML = '<p>Уншиж байна...</p>';

  try {
    const res = await fetch('/api/experiments');
    const data = await res.json();

    if (!data.success || data.experiments.length === 0) {
      simButtons.innerHTML = '<p class="sidebar-loading">Одоогоор туршилт алга байна.</p>';
      editorList.innerHTML = '<p>Одоогоор туршилт алга байна.</p>';
      simTitle.textContent = 'Туршилт удирдах';
      simFrame.src = '';
      return;
    }

    simButtons.innerHTML = '';
    editorList.innerHTML = '';

    data.experiments.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.className = 'sim-btn';
      btn.textContent = item.title;
      btn.onclick = () => loadSim(item.url, item.title);
      simButtons.appendChild(btn);

      const row = document.createElement('div');
      row.className = 'editor-item';

      row.innerHTML = `
        <div class="editor-item-left">
          <div class="lesson-index">${index + 1}</div>
          <div>
            <div class="editor-title">${item.title}</div>
            <a class="file-link" href="${item.url}" target="_blank">${item.url}</a>
          </div>
        </div>
        <div class="editor-actions">
          <button class="small-btn edit-btn" onclick='editExperiment(${JSON.stringify(item)})'>Засах</button>
          <button class="small-btn delete-btn" onclick="deleteExperiment(${item.id})">Устгах</button>
        </div>
      `;

      editorList.appendChild(row);

      if (index === 0) {
        currentSimUrl = item.url;
        simTitle.textContent = item.title;
        simFrame.src = item.url;
      }
    });
  } catch (error) {
    console.error('loadExperiments error:', error);
    simButtons.innerHTML = '<p class="sidebar-loading">Серверийн алдаа гарлаа.</p>';
    editorList.innerHTML = '<p>Серверийн алдаа гарлаа.</p>';
  }
}

function loadSim(url, title) {
  currentSimUrl = url;
  document.getElementById('simFrame').src = url;
  document.getElementById('simTitle').textContent = title || 'Туршилт удирдах';
}

function openExperimentModal() {
  editingExperimentId = null;
  document.getElementById('experimentModalTitle').textContent = 'Шинэ туршилт';
  document.getElementById('experimentTitle').value = '';
  document.getElementById('experimentUrl').value = '';
  document.getElementById('experimentMsg').textContent = '';
  document.getElementById('experimentModal').classList.remove('hidden');
}

function openCurrentSim() {
  window.open(currentSimUrl, "_blank");
}

function closeExperimentModal() {
  document.getElementById('experimentModal').classList.add('hidden');
}

function editExperiment(item) {
  editingExperimentId = item.id;
  document.getElementById('experimentModalTitle').textContent = 'Туршилт засах';
  document.getElementById('experimentTitle').value = item.title || '';
  document.getElementById('experimentUrl').value = item.url || '';
  document.getElementById('experimentMsg').textContent = '';
  document.getElementById('experimentModal').classList.remove('hidden');
}

async function submitExperiment() {
  const title = document.getElementById('experimentTitle').value.trim();
  const url = document.getElementById('experimentUrl').value.trim();
  const msg = document.getElementById('experimentMsg');

  if (!title || !url) {
    msg.textContent = 'Туршилтын нэр болон холбоос оруулна уу.';
    msg.style.color = 'red';
    return;
  }

  try {
    let res;

    if (editingExperimentId) {
      res = await fetch(`/api/experiments/${editingExperimentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url })
      });
    } else {
      res = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url })
      });
    }

    const data = await res.json();

    if (data.success) {
      await loadExperiments();
      closeExperimentModal();
    } else {
      msg.textContent = data.message || 'Алдаа гарлаа.';
      msg.style.color = 'red';
    }
  } catch (error) {
    console.error('submitExperiment error:', error);
    msg.textContent = 'Серверийн алдаа гарлаа.';
    msg.style.color = 'red';
  }
}

async function deleteExperiment(id) {
  const ok = confirm('Энэ туршилтыг устгах уу?');
  if (!ok) return;

  try {
    const res = await fetch(`/api/experiments/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (data.success) {
      await loadExperiments();
    } else {
      alert(data.message || 'Устгах үед алдаа гарлаа.');
    }
  } catch (error) {
    console.error('deleteExperiment error:', error);
    alert('Серверийн алдаа гарлаа.');
  }
}

window.addEventListener('DOMContentLoaded', loadExperiments);