/** Thrown by feature services until a real AI provider is connected. */
export class AINotConnectedError extends Error {
  constructor(feature: string) {
    super(
      `${feature} isn't connected to an AI service yet, so nothing was generated. Your input has been kept so you can try again once it's set up.`,
    );
    this.name = "AINotConnectedError";
  }
}

export type AIResult = { text: string };
