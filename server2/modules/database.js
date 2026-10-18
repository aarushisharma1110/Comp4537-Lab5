const mysql = require("mysql2/promise");

class Database {
    constructor(dbConfig) {
        this.writerPool = mysql.createPool({
            host: dbConfig.HOST,
            database: dbConfig.NAME,
            user: dbConfig.WRITER.USER,
            password: dbConfig.WRITER.PASSWORD,
            connectionLimit: 5
        });

        this.readerPool = mysql.createPool({
            host: dbConfig.HOST,
            database: dbConfig.NAME,
            user: dbConfig.READER.USER,
            password: dbConfig.READER.PASSWORD,
            connectionLimit: 5
        });
    }

    async createTableIfNotExists() {
        const sql = `
            CREATE TABLE IF NOT EXISTS patient (
                patientid   INT(11)      NOT NULL AUTO_INCREMENT,
                name        VARCHAR(100) NOT NULL,
                dateOfBirth DATETIME     NOT NULL,
                PRIMARY KEY (patientid)
            ) ENGINE=InnoDB
        `;
        await this.writerPool.query(sql);
    }

    async insertPatients(patients) {
        await this.createTableIfNotExists();

        const values = patients.map((patient) => [patient.name, patient.dateOfBirth]);

        const [result] = await this.writerPool.query(
            "INSERT INTO patient (name, dateOfBirth) VALUES ?",
            [values]
        );

        return result.affectedRows;
    }

    async runReadQuery(sql) {
        const [rows] = await this.readerPool.query(sql);
        return rows;
    }
}

module.exports = Database;