import { test, expect } from "@playwright/test";
import { V3 } from "../v3.js";
import { v3TestConfig } from "./v3.config.js";

test.describe("Page setExtraHTTPHeaders method", () => {
  let v3: V3;

  test.beforeEach(async () => {
    v3 = new V3(v3TestConfig);
    await v3.init();
  });

  test.afterEach(async () => {
    await v3?.close?.().catch(() => {});
  });

  test("sets extra HTTP headers that are sent with requests", async () => {
    const page = v3.context.pages()[0];

    // Set custom headers
    await page.setExtraHTTPHeaders({
      "X-Custom-Header": "custom-value",
      "X-Another-Header": "another-value",
    });

    // Navigate to httpbin which echoes back request headers
    await page.goto("https://httpbin.org/headers");

    // Extract the response which contains the headers that were sent
    const content = await page.evaluate(() => document.body.textContent);
    const parsed = JSON.parse(content || "{}");

    // Verify our custom headers were sent
    expect(parsed.headers).toBeDefined();
    expect(parsed.headers["X-Custom-Header"]).toBe("custom-value");
    expect(parsed.headers["X-Another-Header"]).toBe("another-value");
  });

  test("overwrites previously set headers", async () => {
    const page = v3.context.pages()[0];

    // Set initial headers
    await page.setExtraHTTPHeaders({
      "X-Custom-Header": "initial-value",
    });

    // Overwrite with new headers
    await page.setExtraHTTPHeaders({
      "X-Custom-Header": "updated-value",
      "X-New-Header": "new-value",
    });

    // Navigate to httpbin which echoes back request headers
    await page.goto("https://httpbin.org/headers");

    // Extract the response
    const content = await page.evaluate(() => document.body.textContent);
    const parsed = JSON.parse(content || "{}");

    // Verify the headers were updated
    expect(parsed.headers["X-Custom-Header"]).toBe("updated-value");
    expect(parsed.headers["X-New-Header"]).toBe("new-value");
  });

  test("clears headers when called with empty object", async () => {
    const page = v3.context.pages()[0];

    // Set initial headers
    await page.setExtraHTTPHeaders({
      "X-Custom-Header": "custom-value",
    });

    // Clear headers by passing empty object
    await page.setExtraHTTPHeaders({});

    // Navigate to httpbin which echoes back request headers
    await page.goto("https://httpbin.org/headers");

    // Extract the response
    const content = await page.evaluate(() => document.body.textContent);
    const parsed = JSON.parse(content || "{}");

    // Verify the custom header is no longer present
    expect(parsed.headers["X-Custom-Header"]).toBeUndefined();
  });
});
