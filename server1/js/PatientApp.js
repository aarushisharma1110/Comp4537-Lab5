
import { EnglishMessages } from "../lang/en/strings.js";
import { CONFIG } from "./config.js";

export class PatientApp {
    constructor() {
        this.messages = new EnglishMessages();
        this.apiOrigin = CONFIG.API_ORIGIN;

        this.insertButton = document.getElementById("insert-button");
        this.submitButton = document.getElementById("submit-button");
        this.sqlQuery = document.getElementById("sql-query");
        this.responseMessage = document.getElementById("response-message");
        this.queryResults = document.getElementById("query-results");
    }

    initialize() {
        this.loadPageText();
        this.setupEventListeners();
    }

    loadPageText() {
        document.title = this.messages.PAGE_TITLE;

        document.getElementById("page-title").textContent =
            this.messages.PAGE_TITLE;

        document.getElementById("page-description").textContent =
            this.messages.PAGE_DESCRIPTION;

        document.getElementById("insert-title").textContent =
            this.messages.INSERT_TITLE;

        document.getElementById("query-title").textContent =
            this.messages.QUERY_TITLE;

        document.getElementById("query-label").textContent =
            this.messages.QUERY_LABEL;

        document.getElementById("result-title").textContent =
            this.messages.RESULT_TITLE;

        this.insertButton.textContent = this.messages.INSERT_BUTTON;
        this.submitButton.textContent = this.messages.SUBMIT_BUTTON;
    }

    setupEventListeners() {
        this.insertButton.addEventListener("click", () => {
            this.insertPatients();
        });

        this.submitButton.addEventListener("click", () => {
            this.executeQuery();
        });
    }

    insertPatients() {
        const xhttp = new XMLHttpRequest();
        const url = this.apiOrigin + CONFIG.ENDPOINTS.INSERT;

        this.showMessage(this.messages.LOADING);
        this.insertButton.disabled = true;

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4 && xhttp.status !== 0) {
                this.insertButton.disabled = false;
                const data = this.parseResponse(xhttp.responseText);

                if (xhttp.status >= 200 && xhttp.status < 300) {
                    this.showMessage(data && data.message ? data.message : xhttp.responseText);
                } else {
                    this.showMessage(this.getErrorMessage(data));
                }
            }
        };

        xhttp.onerror = () => {
            this.insertButton.disabled = false;
            this.showMessage(this.messages.NETWORK_ERROR);
        };

        xhttp.open(CONFIG.METHODS.POST, url, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(CONFIG.PATIENTS));
    }

    executeQuery() {
        const query = this.sqlQuery.value.trim();

        if (query === "") {
            this.queryResults.replaceChildren();
            this.showMessage(this.messages.EMPTY_QUERY);
            return;
        }

        const encodedQuery = encodeURIComponent(query);
        const url = this.apiOrigin + CONFIG.ENDPOINTS.SQL + encodedQuery;

        const xhttp = new XMLHttpRequest();

        this.showMessage(this.messages.LOADING);
        this.submitButton.disabled = true;

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4 && xhttp.status !== 0) {
                this.submitButton.disabled = false;
                const data = this.parseResponse(xhttp.responseText); 

                if (xhttp.status >= 200 && xhttp.status < 300) {
                    this.showMessage(this.messages.QUERY_SUCCESS);
                    this.displayResults(data);
                } else {
                    this.showMessage(this.getErrorMessage(data));
                }
            }
        };

        xhttp.onerror = () => {
            this.submitButton.disabled = false;
            this.showMessage(this.messages.NETWORK_ERROR);
        };

        xhttp.open(CONFIG.METHODS.GET, url, true);
        xhttp.send();
    }

    showMessage(message) {
        this.responseMessage.textContent = message;
    }

    parseResponse(text) {
        try {
            return JSON.parse(text);
        } catch (error) {
            return null;
        }
    }

    getErrorMessage(data) {
        return data && data.error ? data.error : this.messages.SERVER_ERROR;
    }

    displayResults(rows) {
        this.queryResults.textContent = JSON.stringify(rows, null, 2);
    }
}
