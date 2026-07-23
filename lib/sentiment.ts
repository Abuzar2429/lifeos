import Sentiment from "sentiment";

const sentimentAnalyzer = new Sentiment();

/**
 * Analyzes the sentiment of a given text using the AFINN-165 Sentiment Engine.
 * Returns a normalized score between -1.0 and 1.0 (0 = neutral).
 */
export function analyzeSentiment(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  // Clean html tags if present
  const cleanText = text.replace(/<[^>]*>/g, " ");
  const result = sentimentAnalyzer.analyze(cleanText);

  if (!result || result.tokens.length === 0) return 0;

  // result.comparative is normalized per-word score (ranging typically from -1.0 to 1.0)
  // We clamp it between -1.0 and +1.0 and round to 2 decimal places.
  const score = Math.max(-1.0, Math.min(1.0, result.comparative));
  return Math.round(score * 100) / 100;
}
