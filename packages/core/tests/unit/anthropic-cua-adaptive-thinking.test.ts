import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AnthropicCUAClient } from "../../lib/v3/agent/AnthropicCUAClient.js";

// Default medium thinking budget for adaptive thinking
const MEDIUM_THINKING_BUDGET = 10240;

describe("AnthropicCUAClient - Adaptive Thinking", () => {
  describe("4.6 models with adaptive thinking", () => {
    it("enables thinking with medium budget by default for claude-sonnet-4-6", () => {
      const client = new AnthropicCUAClient(
        "anthropic",
        "anthropic/claude-sonnet-4-6",
        undefined,
        { apiKey: "test-key" },
      );

      // Access private thinkingBudget property
      const thinkingBudget = (
        client as unknown as { thinkingBudget: number | null }
      ).thinkingBudget;

      expect(thinkingBudget).toBe(MEDIUM_THINKING_BUDGET);
    });

    it("enables thinking with medium budget by default for claude-opus-4-6", () => {
      const client = new AnthropicCUAClient(
        "anthropic",
        "anthropic/claude-opus-4-6",
        undefined,
        { apiKey: "test-key" },
      );

      const thinkingBudget = (
        client as unknown as { thinkingBudget: number | null }
      ).thinkingBudget;

      expect(thinkingBudget).toBe(MEDIUM_THINKING_BUDGET);
    });

    it("respects explicit thinkingBudget override for 4.6 models", () => {
      const customBudget = 20000;
      const client = new AnthropicCUAClient(
        "anthropic",
        "anthropic/claude-sonnet-4-6",
        undefined,
        { apiKey: "test-key", thinkingBudget: customBudget },
      );

      const thinkingBudget = (
        client as unknown as { thinkingBudget: number | null }
      ).thinkingBudget;

      expect(thinkingBudget).toBe(customBudget);
    });

    it("allows disabling thinking with thinkingBudget: 0", () => {
      const client = new AnthropicCUAClient(
        "anthropic",
        "anthropic/claude-sonnet-4-6",
        undefined,
        { apiKey: "test-key", thinkingBudget: 0 },
      );

      const thinkingBudget = (
        client as unknown as { thinkingBudget: number | null }
      ).thinkingBudget;

      expect(thinkingBudget).toBeNull();
    });
  });

  describe("non-4.6 models without adaptive thinking by default", () => {
    it("does not enable thinking by default for claude-sonnet-4-5", () => {
      const client = new AnthropicCUAClient(
        "anthropic",
        "anthropic/claude-sonnet-4-5-20250929",
        undefined,
        { apiKey: "test-key" },
      );

      const thinkingBudget = (
        client as unknown as { thinkingBudget: number | null }
      ).thinkingBudget;

      expect(thinkingBudget).toBeNull();
    });

    it("does not enable thinking by default for claude-opus-4-5", () => {
      const client = new AnthropicCUAClient(
        "anthropic",
        "anthropic/claude-opus-4-5-20251101",
        undefined,
        { apiKey: "test-key" },
      );

      const thinkingBudget = (
        client as unknown as { thinkingBudget: number | null }
      ).thinkingBudget;

      expect(thinkingBudget).toBeNull();
    });

    it("respects explicit thinkingBudget for non-4.6 models", () => {
      const customBudget = 5000;
      const client = new AnthropicCUAClient(
        "anthropic",
        "anthropic/claude-sonnet-4-5-20250929",
        undefined,
        { apiKey: "test-key", thinkingBudget: customBudget },
      );

      const thinkingBudget = (
        client as unknown as { thinkingBudget: number | null }
      ).thinkingBudget;

      expect(thinkingBudget).toBe(customBudget);
    });
  });
});
