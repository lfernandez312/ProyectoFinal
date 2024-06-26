require('dotenv').config()

module.exports = {
    cookieKey: process.env.COOKIE_KEY,
    ghclientId: process.env.GITHUB_CLIENT_ID,
    ghclientSecret: process.env.GITHUB_CLIENT_SECRET,
    PORT: process.env.PORT,
    URL: process.env.URL,
    JWT_SECRET: process.env.JWT_SECRET,
    URL: process.env.URL,
    STRIPE_PUBLISHABLE_KEY:process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY,
}
