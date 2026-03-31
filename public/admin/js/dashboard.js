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
            <a class="card class-link" href="/admin/class-lesson.html?classId=${item.id}&name=${encodeURIComponent(item.name)}">
            ${item.name}
            </a>

            <div class="class-card-actions">
            <button class="small-btn delete-btn" onclick="deleteClass(${item.id}, '${item.name.replace(/'/g, "\\'")}')">
                Устгах
            </button>
            </div>
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

async function createClass() {
  const classNameInput = document.getElementById('className');
  const msg = document.getElementById('classMsg');

  const name = classNameInput.value.trim();

  if (!name) {
    msg.textContent = 'Ангийн нэр оруулна уу.';
    msg.style.color = 'red';
    return;
  }

  try {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    const data = await res.json();

    if (data.success) {
      msg.textContent = 'Анги амжилттай нэмэгдлээ.';
      msg.style.color = 'green';

      await loadClasses();

      setTimeout(() => {
        closeClassModal();
      }, 500);
    } else {
      msg.textContent = data.message || 'Анги нэмэхэд алдаа гарлаа.';
      msg.style.color = 'red';
    }
  } catch (error) {
    console.error('createClass error:', error);
    msg.textContent = 'Серверийн алдаа гарлаа.';
    msg.style.color = 'red';
  }
}

async function deleteClass(id, name) {
  const ok = confirm(`"${name}" ангийг устгах уу?\nЭнэ ангийн бүх хичээл мөн устна.`);
  if (!ok) return;

  try {
    const res = await fetch(`/api/classes/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (data.success) {
      await loadClasses();
    } else {
      alert(data.message || 'Анги устгах үед алдаа гарлаа.');
    }
  } catch (error) {
    console.error('deleteClass error:', error);
    alert('Серверийн алдаа гарлаа.');
  }
}

window.addEventListener('DOMContentLoaded', loadClasses);