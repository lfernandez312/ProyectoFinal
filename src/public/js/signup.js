function unificarTelefonos() {
  var prefijo = document.getElementById('prefijo').value;
  var numero = document.getElementById('numero').value;

  var telefonoCompleto = prefijo + numero;
  document.getElementById('phone').value = telefonoCompleto;
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('signupForm');

  form.addEventListener('submit', e => {
      e.preventDefault();

      const data = new FormData(form);
      const obj = {};

      data.forEach((value, key) => (obj[key] = value));

      const url = '/users';
      const headers = {
          'Content-Type': 'application/json',
      };
      const method = 'POST';
      const body = JSON.stringify(obj);

      fetch(url, {
          headers,
          method,
          body,
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === 'success') {
              Swal.fire({
                  icon: 'success',
                  title: 'Registro exitoso',
                  text: 'Tu cuenta ha sido creada correctamente.',
              }).then(() => {
                  window.location.href = '/login';
              });
          } else {
              Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: data.error || `Ha ocurrido un error: ${data.error}`,
              });
          }
      })
      .catch(error => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error en el servidor: ${error.message}`,
          });
      });
  });

  document.getElementById('password').addEventListener('input', function () {
      document.getElementById('readonlyPassword').value = this.value;
  });
});