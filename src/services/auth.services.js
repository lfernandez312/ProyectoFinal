const { email_out } = require('../config/services.config');
const transport = require('../utils/nodemailer.util');

const users = []

const createAuth = async authUserInfo => {
    users.push(authUserInfo)

    await transport.sendMail({
        from: email_out.identifier,
        to: authUserInfo.email,
        subject:'Ingresaste al sistema de Coder',
        html: `
        <div>
          <h1>Hola ${authUserInfo.first_name}!!</h1>
          <h2>Ingresaste al sistema, si es un error, te pedimos que cambies la password. Gracias!</h2>
          <img src="cid:logo" alt="Un logo"/>
        </div>
        `,
        attachments:[{
          filename:'logo.png',
          path:'src/public/images/logo.png',
          cid:'logo',
        }]
    })

    return users
}

const forgetPass = async authUserInfo => {
  users.push(authUserInfo)
  await transport.sendMail({
      from: email_out.identifier,
      to: authUserInfo.email,
      subject:'Acabas de restablecer tu Password',
      html: `
      <div>
        <h1>Cambiaste la pass en ${authUserInfo.email}.</h1>
        <h2>Se genero un cambio de pass ya podes ingresar al sistema nuevamente.Gracias!</h2>
        <img src="cid:logo" alt="Un logo"/>
      </div>
      `,
      attachments:[{
        filename:'logo.png',
        path:'src/public/images/logo.png',
        cid:'logo',
      }]
  })

  return users
}

const sendDeleteAccountEmail = async (email) => {
  await transport.sendMail({
      from: email_out.identifier,
      to: email,
      subject: 'Aviso de eliminación de cuenta por inactividad',
      html: `
      <div>
      <h1>Hola!</h1>
        <h2>Te informamos que tu cuenta será eliminada debido a la falta de actividad durante un período prolongado.</h2>
        <p>Si deseas conservar tu cuenta, te recomendamos iniciar sesión y utilizar nuestros servicios.</p>
        <img src="cid:logo" alt="Un logo"/>
      </div>
      `,
      attachments: [{
          filename: 'logo.png',
          path: 'src/public/images/logo.png',
          cid: 'logo',
      }]
  });
};

const sendDeleteProduct = async (user) => {
  await transport.sendMail({
    from: email_out.identifier,
    to: user.email,
    subject: 'Producto eliminado',
    html: `
      <div>
        <h1>Hola ${user.first_name}!</h1>
        <p>Te informamos que uno de tus productos ha sido eliminado de nuestro sistema.</p>
        <p>Si tienes alguna pregunta, por favor, contacta con nuestro soporte.</p>
        <img src="cid:logo" alt="Logo" />
      </div>
    `,
    attachments: [{
      filename: 'logo.png',
      path: 'src/public/images/logo.png',
      cid: 'logo',
    }]
  });
};

module.exports = {
    createAuth,
    forgetPass,
    sendDeleteAccountEmail,
    sendDeleteProduct,
}