import "@testing-library/jest-dom";

// Polyfill Response for unit tests that mock fetch (e.g. lib/api/flights.test.ts)
if (typeof globalThis.Response === "undefined") {
  globalThis.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status ?? 200;
      this.ok = this.status >= 200 && this.status < 300;
    }
    async text() {
      return typeof this.body === "string" ? this.body : (this.body && this.body.toString()) ?? "";
    }
    async json() {
      const t = await this.text();
      try {
        return JSON.parse(t);
      } catch {
        throw new TypeError("JSON parse error");
      }
    }
  };
}
