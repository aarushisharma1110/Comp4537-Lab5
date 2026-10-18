// Claude (Anthropic, https://claude.ai) was used to help develop this solution.

const http = require("http");
const CONFIG = require("./config.js");
const STRINGS = require("./lang/en/strings.js");
const Database = require("./modules/database.js");

class Server {
    constructor(config, database) {
        this.port = config.PORT;
        this.allowedOrigin = config.ALLOWED_ORIGIN;
        this.database = database;
    }

    start() {
        http.createServer((req, res) => {
            this.handleRequest(req, res);
        }).listen(this.port);
    }

    handleRequest(req, res) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        if (path.includes("/api/v1/insert")) {
            if (req.method === "POST") {
                this.handleInsert(req, res);
            } else {
                this.sendJson(res, 405, { error: STRINGS.METHOD_NOT_ALLOWED });
            }
        } else if (path.includes("/api/v1/sql/")) {
            if (req.method === "GET") {
                this.handleQuery(path, res);
            } else {
                this.sendJson(res, 405, { error: STRINGS.METHOD_NOT_ALLOWED });
            }
        } else {
            this.sendJson(res, 404, { error: STRINGS.NOT_FOUND });
        }
    }

    setCorsHeaders(res) {
        res.setHeader("Access-Control-Allow-Origin", this.allowedOrigin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    readBody(req) {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });
            req.on("end", () => resolve(body));
            req.on("error", reject);
        });
    }

    async handleInsert(req, res) {
        try {
            const body = await this.readBody(req);
            const patients = JSON.parse(body);

            if (!Array.isArray(patients) || patients.length === 0) {
                this.sendJson(res, 400, { error: STRINGS.INVALID_BODY });
                return;
            }

            const count = await this.database.insertPatients(patients);
            this.sendJson(res, 200, {
                message: STRINGS.INSERT_SUCCESS.replace("%1", count)
            });
        } catch (error) {
            if (error instanceof SyntaxError) {
                this.sendJson(res, 400, { error: STRINGS.INVALID_BODY });
            } else {
                this.sendJson(res, 500, {
                    error: STRINGS.INSERT_ERROR.replace("%1", error.message)
                });
            }
        }
    }

    async handleQuery(path, res) {
        const marker = "/api/v1/sql/";

        try {
            const encoded = path.substring(path.indexOf(marker) + marker.length);
            let sql = decodeURIComponent(encoded).trim();

            if (sql.length >= 2 && sql.startsWith('"') && sql.endsWith('"')) {
                sql = sql.slice(1, -1).trim();
            }

            if (sql === "") {
                this.sendJson(res, 400, { error: STRINGS.EMPTY_QUERY });
                return;
            }

            const rows = await this.database.runReadQuery(sql);
            this.sendJson(res, 200, rows);
        } catch (error) {
            this.sendJson(res, 400, {
                error: STRINGS.QUERY_ERROR.replace("%1", error.message)
            });
        }
    }

    sendJson(res, status, data) {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
    }
}

const database = new Database(CONFIG.DB);
new Server(CONFIG, database).start();