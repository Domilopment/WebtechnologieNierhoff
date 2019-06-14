/*
    Basic Server configuration
*/
module.exports = {
    DBNAME: "Pidvid",
    PORT: 300,
    TOKEN_LENGTH: 300,
    SALT_LENGTH: 40,
    FEED_LENGTH: 10,

    MAX_ERROR_LOG_SIZE_IN_BYTES: 1500,
    ERROR_LOG_PATH: "./logs/error.txt",
    ERROR_TO_CONSOLE_ENABLED: true,

    MAX_DEBUG_LOG_SIZE_IN_BYTES: 1500,
    DEBUG_LOG_PATH: "./logs/debug.txt",
    DEBUG_LOG_ENABELD: true,
    DEBUG_TO_CONSOLE_ENABLED: true
}