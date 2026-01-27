import { describe, expect, it } from "vitest";
import { LLMProvider } from "../lib/v3/llm/LLMProvider";
import { UnsupportedModelError } from "../lib/v3/types/public/sdkErrors";

describe("UnsupportedModelError message format", () => {
  describe("when using an unsupported old-format model name", () => {
    it("should encourage the new provider/model-name format in the error message", () => {
      const logger = () => {};
      const provider = new LLMProvider(logger);

      let error: Error | null = null;
      try {
        // Using an unsupported old-format model name (without provider/ prefix)
        provider.getClient("unsupported-model-name" as any);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(UnsupportedModelError);

      // The error message should guide users to use the new format
      expect(error!.message).toContain("provider/model-name");

      // The error message should provide an example of the correct format
      expect(error!.message).toMatch(/openai\/gpt-4/i);
    });

    it("should not just list old-style model names without guidance", () => {
      const logger = () => {};
      const provider = new LLMProvider(logger);

      let error: Error | null = null;
      try {
        provider.getClient("some-invalid-model" as any);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(UnsupportedModelError);

      // The error message should mention the new format, not just list old models
      // It should NOT just say "please use one of the supported models: gpt-4.1, gpt-4.1-mini..."
      // Instead it should guide towards the new format like "provider/model-name"
      expect(error!.message.toLowerCase()).toContain("provider/");
    });
  });

  describe("UnsupportedModelError constructor", () => {
    it("should include guidance about the new model format", () => {
      const supportedModels = ["gpt-4.1", "gpt-4o", "claude-3-5-sonnet-latest"];
      const error = new UnsupportedModelError(supportedModels);

      // Error message should encourage the new format
      expect(error.message).toContain("provider/model-name");
    });

    it("should include guidance even when a feature is specified", () => {
      const supportedModels = ["gpt-4.1", "gpt-4o"];
      const error = new UnsupportedModelError(supportedModels, "CUA agent");

      // Error message should still encourage the new format
      expect(error.message).toContain("provider/model-name");
    });
  });
});
