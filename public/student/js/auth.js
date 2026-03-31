<<<<<<< HEAD
const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'student') {
  window.location.href = '/';
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/';
=======
const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'student') {
  window.location.href = '/';
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/';
>>>>>>> f0a059cb5a8c2336b0078ed73e32535cafec65c9
}