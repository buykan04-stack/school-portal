async function loadClasses() {
  const classList = document.getElementById('classList');
  classList.innerHTML = '<p>Уншиж байна...</p>';

  try {
    const res = await fetch('/api/classes');
    const data = await res.json();

    if (!data.success) {
      classList.innerHTML = '<p>Ангиудыг уншиж чадсангүй.</p>';
      return;
    }

    if (data.classes.length === 0) {
      classList.innerHTML = '<p>Одоогоор анги алга байна.</p>';
      return;
    }

    classList.innerHTML = '';

    data.classes.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'class-card';

        div.innerHTML = `
            <a class="card class-link" href="/student/class-lesson.html?classId=${item.id}&name=${encodeURIComponent(item.name)}">
            ${item.name}
            </a>
        `;

        classList.appendChild(div);
    });
  } catch (error) {
    console.error('loadClasses error:', error);
    classList.innerHTML = '<p>Серверийн алдаа гарлаа.</p>';
  }
}

function openClassModal() {
  document.getElementById('classModal').classList.remove('hidden');
  document.getElementById('className').value = '';
  document.getElementById('classMsg').textContent = '';
}

function closeClassModal() {
  document.getElementById('classModal').classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', loadClasses);   