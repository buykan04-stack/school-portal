const params = new URLSearchParams(window.location.search);
const classId = params.get('classId');
const className = params.get('name');

let editingLessonId = null;

document.getElementById('classTitle').textContent = className || 'Анги';

async function loadLessons() {
  const lessonList = document.getElementById('lessonList');
  lessonList.innerHTML = '<p>Уншиж байна...</p>';

  try {
    const res = await fetch(`/api/lessons/by-class/${classId}`);
    const data = await res.json();

    if (!data.success) {
      lessonList.innerHTML = '<p>Хичээлүүдийг уншиж чадсангүй.</p>';
      return;       
    }

    if (data.lessons.length === 0) {
      lessonList.innerHTML = '<p>Одоогоор хичээл алга байна.</p>';
      return;
    }

    lessonList.innerHTML = '';

    data.lessons.forEach((lesson, index) => {
      const div = document.createElement('div');
      div.className = 'lesson-item';

      div.innerHTML = `
        <div class="lesson-main">
            <div class="lesson-index">${index + 1}</div>

            <div class="lesson-content">
            <h3>${lesson.title}</h3>
            <p>${lesson.description || 'Тайлбар оруулаагүй байна.'}</p>

            <div id="files-${lesson.id}" class="file-list"></div>
            </div>
        </div>
        `;

      lessonList.appendChild(div);
            setTimeout(() => {
        loadLessonFiles(lesson.id);
        }, 0);
    });
  } catch (error) {
    console.error('loadLessons error:', error);
    lessonList.innerHTML = '<p>Серверийн алдаа гарлаа.</p>';
  }
}

function openLessonModal() {
  editingLessonId = null;
  document.getElementById('modalTitle').textContent = 'Шинэ хичээл';
  document.getElementById('lessonTitle').value = '';
  document.getElementById('lessonDescription').value = '';
  document.getElementById('lessonMsg').textContent = '';
  document.getElementById('lessonFile').value = '';
  document.getElementById('lessonModal').classList.remove('hidden');
}

function closeLessonModal() {
  document.getElementById('lessonModal').classList.add('hidden');
}

async function loadLessonFiles(lessonId) {
  const res = await fetch(`/api/lessons/files/${lessonId}`);
  const data = await res.json();

  const container = document.getElementById(`files-${lessonId}`);
  container.innerHTML = '';

  data.files.forEach(f => {
    const a = document.createElement('a');
    a.href = f.file_path;
    a.target = "_blank";
    a.textContent = f.file_name;

    container.appendChild(a);
    container.appendChild(document.createElement('br'));
  });
}

async function loadLessonFiles(lessonId) {
  try {
    const res = await fetch(`/api/lessons/files/${lessonId}`);
    const data = await res.json();

    const container = document.getElementById(`files-${lessonId}`);
    if (!container) return;

    container.innerHTML = '';

    if (!data.success || data.files.length === 0) {
      container.innerHTML = '<p class="empty-file">Файл оруулаагүй байна.</p>';
      return;
    }

    data.files.forEach((f) => {
      const a = document.createElement('a');
      a.href = f.file_path;
      a.target = '_blank';
      a.textContent = f.file_name;
      a.className = 'file-link';

      container.appendChild(a);
    });
  } catch (error) {
    console.error('loadLessonFiles error:', error);
  }
}

window.addEventListener('DOMContentLoaded', loadLessons);