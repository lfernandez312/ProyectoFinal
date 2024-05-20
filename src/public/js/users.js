// Función para eliminar un usuario
async function deleteUser(userId) {
    try {
        // Realizar la solicitud para eliminar el usuario
        const response = await fetch(`/api/users/delete/${userId}`, {
            method: 'POST'
        });

        // Verificar si la solicitud fue exitosa (estado HTTP 200)
        if (response.ok) {
            // Mostrar mensaje de Sweet Alert
            Swal.fire({
                icon: 'success',
                title: 'Usuario eliminado correctamente',
                text: 'El usuario ha sido eliminado correctamente.'
            }).then(() => {
                // Redirigir al usuario a la página de usuarios
                window.location.href = '/api/users';
            });
        } else {
            // Mostrar mensaje de error si la solicitud falla
            throw new Error('Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        // Mostrar mensaje de error genérico si ocurre algún problema
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar el usuario. Por favor, inténtalo de nuevo más tarde.'
        });
    }
}

// Función para enviar una notificación a un usuario
async function sendNotification(userId) {
    try {
        // Realizar la solicitud para enviar la notificación
        const response = await fetch(`/api/users/notify/${userId}`, {
            method: 'POST'
        });

        // Verificar si la solicitud fue exitosa (estado HTTP 200)
        if (response.ok) {
            // Mostrar mensaje de Sweet Alert
            Swal.fire({
                icon: 'success',
                title: 'Notificación enviada correctamente',
                text: 'El correo electrónico de notificación ha sido enviado correctamente.'
            });
        } else {
            // Mostrar mensaje de error si la solicitud falla
            throw new Error('Error al enviar la notificación');
        }
    } catch (error) {
        console.error('Error al enviar la notificación:', error);
        // Mostrar mensaje de error genérico si ocurre algún problema
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al enviar la notificación. Por favor, inténtalo de nuevo más tarde.'
        });
    }
}

// Función para cambiar el rol del usuario
async function changeUserRole(userId, currentRole) {
    try {
        const response = await fetch(`/api/users/premium/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentRole })
        });
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Rol actualizado correctamente',
                text: 'El rol del usuario ha sido actualizado.'
            }).then(() => {
                window.location.reload(); // Recargar la página después de actualizar el rol
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorData.error || 'Ocurrió un error al actualizar el rol del usuario.'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar el rol del usuario. Por favor, inténtalo de nuevo más tarde.'
        });
    }
}