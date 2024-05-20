const { customizeError } = require('../services/error.services');

const isUser = (req, res, next) => {
    if (req.user.role === 'user') {
        next();
    } else {
        const errorMessage = customizeError('UNAUTHORIZED_ACCESS');
        const sweetAlertScript = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Access Denied</title>
                <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            </head>
            <body>
                <script>
                    Swal.fire({ title: 'Access Denied', text: '${errorMessage}', icon: 'error' }).then(() => window.location.href = '/profile');
                </script>
            </body>
            </html>
        `;
        res.send(sweetAlertScript);
    }
};

module.exports = isUser;
