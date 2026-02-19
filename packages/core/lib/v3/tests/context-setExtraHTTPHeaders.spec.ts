import { test, expect } from "@playwright/test";
import { V3 } from "../v3.js";
import { v3TestConfig } from "./v3.config.js";
import { V3Context } from "../understudy/context.js";

test.describe("context.setExtraHTTPHeaders", () => {
  let v3: V3;
  let ctx: V3Context;

  test.beforeEach(async () => {
    v3 = new V3(v3TestConfig);
    await v3.init();
    ctx = v3.context;
  });

  test.afterEach(async () => {
    await v3?.close?.().catch(() => {});
  });

  test("sends custom headers with all requests", async () => {
    const page = await ctx.awaitActivePage();

    await ctx.setExtraHTTPHeaders({
      "X-Custom-Header": "stagehand-test-value",
      "X-Another-Header": "another-value",
    });

    // Navigate to httpbin which echoes back headers
    await page.goto("https://httpbin.org/headers", { waitUntil: "load" });

    // Extract the response body which contains the headers
    const responseText = await page.evaluate(() => document.body.textContent);
    const data = JSON.parse(responseText || "{}");

    expect(data.headers["X-Custom-Header"]).toBe("stagehand-test-value");
    expect(data.headers["X-Another-Header"]).toBe("another-value");
  });

  test("applies headers to newly created pages", async () => {
    await ctx.setExtraHTTPHeaders({
      "X-New-Page-Header": "new-page-value",
    });

    // Create a new page - headers should apply to it
    const newPage = await ctx.newPage();
    await newPage.goto("https://httpbin.org/headers", { waitUntil: "load" });

    const responseText = await newPage.evaluate(
      () => document.body.textContent,
    );
    const data = JSON.parse(responseText || "{}");

    expect(data.headers["X-New-Page-Header"]).toBe("new-page-value");
  });

  test("applies headers to existing pages after setExtraHTTPHeaders is called", async () => {
    const page = await ctx.awaitActivePage();

    // Navigate first to establish the page
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    // Now set headers
    await ctx.setExtraHTTPHeaders({
      "X-Late-Header": "late-value",
    });

    // Navigate again - headers should be applied
    await page.goto("https://httpbin.org/headers", { waitUntil: "load" });

    const responseText = await page.evaluate(() => document.body.textContent);
    const data = JSON.parse(responseText || "{}");

    expect(data.headers["X-Late-Header"]).toBe("late-value");
  });

  test("overwrites previous headers when called multiple times", async () => {
    const page = await ctx.awaitActivePage();

    await ctx.setExtraHTTPHeaders({
      "X-First-Header": "first-value",
    });

    // Call again with different headers
    await ctx.setExtraHTTPHeaders({
      "X-Second-Header": "second-value",
    });

    await page.goto("https://httpbin.org/headers", { waitUntil: "load" });

    const responseText = await page.evaluate(() => document.body.textContent);
    const data = JSON.parse(responseText || "{}");

    // Second call should have replaced the first
    expect(data.headers["X-Second-Header"]).toBe("second-value");
    expect(data.headers["X-First-Header"]).toBeUndefined();
  });

  test("clears headers when called with empty object", async () => {
    const page = await ctx.awaitActivePage();

    await ctx.setExtraHTTPHeaders({
      "X-Test-Header": "test-value",
    });

    // Clear headers
    await ctx.setExtraHTTPHeaders({});

    await page.goto("https://httpbin.org/headers", { waitUntil: "load" });

    const responseText = await page.evaluate(() => document.body.textContent);
    const data = JSON.parse(responseText || "{}");

    expect(data.headers["X-Test-Header"]).toBeUndefined();
  });
});
