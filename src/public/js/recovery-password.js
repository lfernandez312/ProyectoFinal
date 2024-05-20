document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('recoveryPass').addEventListener('submit', async function(event) {
        event.preventDefault();

        var formData = {
            'email': document.getElementById('email').value
        };

        try {
            const response = await fetch('/pass/recoveryPass', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // La solicitud fue exitosa
                if (data.status === 'success') {
                    // Muestra un mensaje de éxito al usuario
                    Swal.fire({
                        icon: 'success',
                        title: 'Solicitud exitosa',
                        text: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.',
                    });
                } else {
                    // Muestra un mensaje de error al usuario si la solicitud falla
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message,
                    });
                }
            } else {
                // La solicitud no fue exitosa
                throw new Error(data.message);
            }
        } catch (error) {
            // Muestra un mensaje de error al usuario si hay un error de red o servidor
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `${error.message}`,
            });
        }
    });
});