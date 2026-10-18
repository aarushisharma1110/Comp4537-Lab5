class EnglishMessages {
    constructor() {
        this.INSERT_SUCCESS = "%1 rows inserted successfully.",
        this.INVALID_BODY = "Request body must be a JSON array of patients.",
        this.EMPTY_QUERY = "Please provide an SQL query.",
        this.QUERY_ERROR = "Query failed: %1",
        this.INSERT_ERROR = "Insert failed: %1",
        this.NOT_FOUND = "404: Not Found",
        this.METHOD_NOT_ALLOWED = "405: Method Not Allowed"
     }
};

module.exports = new EnglishMessages();