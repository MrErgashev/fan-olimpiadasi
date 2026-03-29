export interface ParseError {
  type:
    | "MISSING_QUESTION_TEXT"
    | "MISSING_OPTION"
    | "NO_CORRECT_ANSWER"
    | "MULTIPLE_CORRECT_ANSWERS"
    | "INVALID_FORMAT";
  message: string;
}

export interface ParsedQuestion {
  index: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  errors: ParseError[];
  isValid: boolean;
}

// Matches option lines: A) text, * B) text, *C) text, etc.
// Only matches uppercase A-D at the start of a line (with optional * and spaces)
const OPTION_REGEX = /^\s*(\*?)\s*([A-D])\)\s*(.+)/;

// Also match lowercase a-d but ONLY when it's a standalone option line
// (not when multiple a) b) c) d) appear on same line - that's question text)
const OPTION_REGEX_LOWER = /^\s*(\*?)\s*([a-d])\)\s*(.+)/;

const QUESTION_NUM_REGEX = /^\s*(\d+)\.\s*(.*)/;

/**
 * Check if a line is a real option line (not embedded question text).
 * Lines like "a) epigam b) progam c) singam" have multiple letter+) patterns
 * and should be treated as question text, not as option A.
 */
function isRealOptionLine(line: string): boolean {
  // First check uppercase - these are always real options
  if (OPTION_REGEX.test(line)) {
    return true;
  }

  // For lowercase, check if the line has multiple "letter)" patterns
  // which indicates it's question text defining variables
  if (OPTION_REGEX_LOWER.test(line)) {
    // Count how many x) patterns exist on this line
    // \b prevents matching inside words like "dollarda)" or "(Mutloq)"
    // [a-d] limits to valid option letters only (not e-z like "(-m)" or "(-e)")
    const letterParenMatches = line.match(/\b[a-d]\)/g);
    if (letterParenMatches && letterParenMatches.length > 1) {
      // Multiple letter) patterns = question text, not an option
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Extract option data from a line. Returns null if not a valid option line.
 */
function extractOption(line: string): { isCorrect: boolean; letter: string; text: string } | null {
  let match = line.match(OPTION_REGEX);
  if (!match) {
    // Try lowercase only if it's a real option line
    if (!isRealOptionLine(line)) return null;
    match = line.match(OPTION_REGEX_LOWER);
  }
  if (!match) return null;

  return {
    isCorrect: match[1] === "*",
    letter: match[2].toUpperCase(),
    text: match[3].trim(),
  };
}

export function parseQuestions(rawText: string): ParsedQuestion[] {
  if (!rawText.trim()) return [];

  // Normalize line endings
  let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Normalize Cyrillic look-alike letters to Latin equivalents
  // А→A, В→B, С→C, Д→D (uppercase Cyrillic to uppercase Latin)
  text = text.replace(/А\)/g, "A)").replace(/В\)/g, "B)")
             .replace(/С\)/g, "C)").replace(/Д\)/g, "D)");
  // Lowercase Cyrillic to lowercase Latin
  text = text.replace(/а\)/g, "a)").replace(/в\)/g, "b)")
             .replace(/с\)/g, "c)").replace(/д\)/g, "d)");
  // With * marker (handle space between * and letter)
  text = text.replace(/\*\s*А\)/g, "*A)").replace(/\*\s*В\)/g, "*B)")
             .replace(/\*\s*С\)/g, "*C)").replace(/\*\s*Д\)/g, "*D)");

  // Split into question blocks by detecting lines starting with a number + dot
  const blocks: string[] = [];
  let currentBlock = "";

  for (const line of text.split("\n")) {
    const qMatch = line.match(QUESTION_NUM_REGEX);
    // A line is a new question if:
    // 1) It matches question number format (number + dot)
    // 2) It's NOT a real option line (like "A) answer text")
    // 3) It does NOT look like a numbered list (e.g. "1.simob 2.naftalin")
    const isNewQuestion = qMatch &&
      !isRealOptionLine(line) &&
      // \S+ right after dot requires no space (catches "1.simob 2.naftalin" but not "12. Text $50. More")
      !/^\s*\d+\.\S+.*\d+\.\S+/.test(line);
    if (isNewQuestion && currentBlock.trim()) {
      blocks.push(currentBlock.trim());
      currentBlock = "";
    }
    currentBlock += line + "\n";
  }
  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }

  const results: ParsedQuestion[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const errors: ParseError[] = [];

    // Extract question number and first line of text
    const firstLineMatch = lines[0].match(QUESTION_NUM_REGEX);
    if (!firstLineMatch) {
      continue; // Skip blocks that don't start with a number
    }

    const index = parseInt(firstLineMatch[1], 10);

    // Collect question text lines (everything before the first real option)
    const questionLines: string[] = [];
    let optionStartIdx = 0;

    if (firstLineMatch[2].trim()) {
      questionLines.push(firstLineMatch[2].trim());
    }

    for (let i = 1; i < lines.length; i++) {
      if (isRealOptionLine(lines[i])) {
        optionStartIdx = i;
        break;
      }
      if (lines[i].trim()) {
        questionLines.push(lines[i].trim());
      }
      optionStartIdx = i + 1;
    }

    const questionText = questionLines.join(" ").trim();

    // Extract options
    const options: Record<string, string> = {};
    const correctAnswers: string[] = [];

    for (let i = optionStartIdx; i < lines.length; i++) {
      const opt = extractOption(lines[i]);
      if (!opt) continue;

      options[opt.letter] = opt.text;
      if (opt.isCorrect) {
        correctAnswers.push(opt.letter);
      }
    }

    // Validate
    if (!questionText) {
      errors.push({
        type: "MISSING_QUESTION_TEXT",
        message: `${index}-savol: Savol matni topilmadi`,
      });
    }

    for (const letter of ["A", "B", "C", "D"]) {
      if (!options[letter]) {
        errors.push({
          type: "MISSING_OPTION",
          message: `${index}-savol: "${letter}" variant topilmadi`,
        });
      }
    }

    if (correctAnswers.length === 0) {
      errors.push({
        type: "NO_CORRECT_ANSWER",
        message: `${index}-savol: To'g'ri javob belgilanmagan (* belgisi yo'q)`,
      });
    } else if (correctAnswers.length > 1) {
      errors.push({
        type: "MULTIPLE_CORRECT_ANSWERS",
        message: `${index}-savol: Bir nechta to'g'ri javob belgilangan (${correctAnswers.join(", ")})`,
      });
    }

    results.push({
      index,
      questionText,
      optionA: options["A"] || "",
      optionB: options["B"] || "",
      optionC: options["C"] || "",
      optionD: options["D"] || "",
      correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : "",
      errors,
      isValid: errors.length === 0,
    });
  }

  return results;
}

export function validateQuestion(q: ParsedQuestion): ParsedQuestion {
  const errors: ParseError[] = [];

  if (!q.questionText.trim()) {
    errors.push({
      type: "MISSING_QUESTION_TEXT",
      message: `${q.index}-savol: Savol matni topilmadi`,
    });
  }

  for (const [letter, value] of [
    ["A", q.optionA],
    ["B", q.optionB],
    ["C", q.optionC],
    ["D", q.optionD],
  ] as const) {
    if (!value.trim()) {
      errors.push({
        type: "MISSING_OPTION",
        message: `${q.index}-savol: "${letter}" variant topilmadi`,
      });
    }
  }

  if (!q.correctAnswer) {
    errors.push({
      type: "NO_CORRECT_ANSWER",
      message: `${q.index}-savol: To'g'ri javob belgilanmagan`,
    });
  }

  return { ...q, errors, isValid: errors.length === 0 };
}
