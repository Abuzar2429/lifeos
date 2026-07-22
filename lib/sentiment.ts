const positiveWords = new Set([
  "happy", "joy", "joyful", "peace", "peaceful", "calm", "calmness", "excited", "excitement",
  "grateful", "gratitude", "accomplished", "accomplish", "proud", "productive", "productivity",
  "success", "successful", "wonderful", "amazing", "great", "good", "excellent", "healthy",
  "energetic", "energy", "focus", "focused", "discipline", "disciplined", "love", "loved",
  "satisfied", "satisfaction", "relief", "relieved", "hopeful", "hope", "motivated", "motivation",
  "active", "rested", "blessed", "optimistic", "cheerful", "refresh", "refreshed", "inspired",
  "inspire", "glad", "delighted", "awesome", "fantastic", "triumph"
]);

const negativeWords = new Set([
  "sad", "sadness", "bad", "angry", "anger", "stressed", "stress", "tired", "tiredness",
  "anxious", "anxiety", "worried", "worry", "failure", "fail", "failed", "lazy", "laziness",
  "depressed", "depression", "lonely", "loneliness", "exhausted", "exhaustion", "sick", "sickness",
  "pain", "painful", "rough", "difficult", "difficulty", "disappointed", "disappointment",
  "annoyed", "annoyance", "frustrated", "frustration", "overwhelmed", "restless", "bored",
  "boredom", "guilty", "guilt", "regret", "unproductive", "scared", "fear", "fearful", "weak",
  "hurt", "grief", "gloomy", "heavy", "stuck"
]);

/**
 * Analyzes the sentiment of a given text and returns a score from -1.0 to 1.0.
 * Returns 0 if neutral or no emotional words are found.
 */
export function analyzeSentiment(text: string): number {
  if (!text) return 0;

  // Normalize text: lowercase, remove non-alphabetic characters except spaces, and split into words
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;

  normalized.forEach((word) => {
    if (positiveWords.has(word)) {
      positiveCount++;
    } else if (negativeWords.has(word)) {
      negativeCount++;
    }
  });

  const totalMatches = positiveCount + negativeCount;
  if (totalMatches === 0) return 0;

  // Calculate score between -1.0 and +1.0
  const score = (positiveCount - negativeCount) / totalMatches;
  
  // Round to 2 decimal places for clean representation
  return Math.round(score * 100) / 100;
}
