const user = JSON.parse(localStorage.getItem('user'));

if (!user || user.role !== 'admin') {
  window.location.href = '/';
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/';
}