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

const OPTION_REGEX = /^\s*(\*?)\s*([a-dA-D])\)\s*(.+)/;
const QUESTION_NUM_REGEX = /^\s*(\d+)\.\s+(.*)/;

export function parseQuestions(rawText: string): ParsedQuestion[] {
  if (!rawText.trim()) return [];

  // Normalize line endings
  let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Normalize Cyrillic look-alike letters to Latin equivalents
  // А→A, В→B, С→C, Д→D (both uppercase and lowercase)
  text = text.replace(/А\)/g, "A)").replace(/В\)/g, "B)")
             .replace(/С\)/g, "C)").replace(/Д\)/g, "D)")
             .replace(/а\)/g, "a)").replace(/в\)/g, "b)")
             .replace(/с\)/g, "c)").replace(/д\)/g, "d)");
  // With * marker
  text = text.replace(/\*\s*А\)/g, "*A)").replace(/\*\s*В\)/g, "*B)")
             .replace(/\*\s*С\)/g, "*C)").replace(/\*\s*Д\)/g, "*D)");

  // Split into question blocks by detecting lines starting with a number + dot
  const blocks: string[] = [];
  let currentBlock = "";

  for (const line of text.split("\n")) {
    // A line is a new question only if it matches question number format,
    // is NOT an option line, and does NOT look like a numbered list item
    // (e.g. "1.simob 2.naftalin" has multiple "number.text" patterns)
    const isNewQuestion = QUESTION_NUM_REGEX.test(line) &&
      !OPTION_REGEX.test(line) &&
      !/^\s*\d+\.\s*\S+.*\d+\.\s*\S+/.test(line);
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

    // Collect question text lines (everything before the first option)
    const questionLines: string[] = [];
    let optionStartIdx = 0;

    if (firstLineMatch[2].trim()) {
      questionLines.push(firstLineMatch[2].trim());
    }

    for (let i = 1; i < lines.length; i++) {
      if (OPTION_REGEX.test(lines[i])) {
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
      const match = lines[i].match(OPTION_REGEX);
      if (!match) continue;

      const isCorrect = match[1] === "*";
      const letter = match[2].toUpperCase();
      const optionText = match[3].trim();

      options[letter] = optionText;
      if (isCorrect) {
        correctAnswers.push(letter);
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
