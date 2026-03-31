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

        <div class="lesson-actions">
            <button class="small-btn edit-btn" onclick='editLesson(${JSON.stringify(lesson)})'>Засах</button>
            <button class="small-btn delete-btn" onclick="deleteLesson(${lesson.id})">Устгах</button>
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

function editLesson(lesson) {
  editingLessonId = lesson.id;
  document.getElementById('modalTitle').textContent = 'Хичээл засах';
  document.getElementById('lessonTitle').value = lesson.title || '';
  document.getElementById('lessonDescription').value = lesson.description || '';
  document.getElementById('lessonMsg').textContent = '';
  document.getElementById('lessonFile').value = '';
  document.getElementById('lessonModal').classList.remove('hidden');
}

async function submitLesson() {
  const title = document.getElementById('lessonTitle').value.trim();
  const description = document.getElementById('lessonDescription').value.trim();
  const fileInput = document.getElementById('lessonFile');
  const file = fileInput.files[0];
  const msg = document.getElementById('lessonMsg');

  if (!title) {
    msg.textContent = 'Хичээлийн нэр оруулна уу.';
    msg.style.color = 'red';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (!editingLessonId) {
      formData.append('class_id', classId);
    }

    if (file) {
      formData.append('file', file);
    }

    let res;

    if (editingLessonId) {
      res = await fetch(`/api/lessons/${editingLessonId}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      res = await fetch('/api/lessons', {
        method: 'POST',
        body: formData
      });
    }

    const data = await res.json();

    if (data.success) {
      msg.textContent = editingLessonId
        ? 'Хичээл амжилттай шинэчлэгдлээ.'
        : 'Хичээл амжилттай нэмэгдлээ.';
      msg.style.color = 'green';

      await loadLessons();

      setTimeout(() => {
        closeLessonModal();
      }, 400);
    } else {
      msg.textContent = data.message || 'Алдаа гарлаа.';
      msg.style.color = 'red';
    }
  } catch (error) {
    console.error('submitLesson error:', error);
    msg.textContent = 'Серверийн алдаа гарлаа.';
    msg.style.color = 'red';
  }
}

async function uploadFile(event, lessonId) {
  const file = event.target.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('lesson_id', lessonId);

  const res = await fetch('/api/lessons/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (data.success) {
    loadLessonFiles(lessonId);
  } else {
    alert('Файл upload алдаа');
  }
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

async function deleteLesson(id) {
  const ok = confirm('Энэ хичээлийг устгах уу?');
  if (!ok) return;

  try {
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (data.success) {
      await loadLessons();
    } else {
      alert(data.message || 'Устгах үед алдаа гарлаа.');
    }
  } catch (error) {
    console.error('deleteLesson error:', error);
    alert('Серверийн алдаа гарлаа.');
  }
}

window.addEventListener('DOMContentLoaded', loadLessons);