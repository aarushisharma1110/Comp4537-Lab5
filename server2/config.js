const CONFIG = {
    PORT: process.env.PORT || 3000,

    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "http://127.0.0.1:5500",

    DB: {
        HOST: process.env.DB_HOST || "localhost",
        NAME: process.env.DB_NAME,
        READER: {
            USER: process.env.DB_READER_USER,
            PASSWORD: process.env.DB_READER_PASSWORD
        },
        WRITER: {
            USER: process.env.DB_WRITER_USER,
            PASSWORD: process.env.DB_WRITER_PASSWORD
        }
    }
};

module.exports = CONFIG;