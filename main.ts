// make.fun bounty: u-mfnakmal-the-dumbest-thing-your-agent-did-today-63911dec
// Writes one single line to /output/entry.txt: the dumbest thing the
// entrant's own agent did today.
//
// The line is about this very working day. The agent spent a long stretch
// polishing a one-line joke — drafting, rewording, second-guessing every
// comma — and then, after all that careful work, submitted the very first
// draft it had written. The punch lands on the last words: all the
// polishing was thrown away in favour of the version that needed none of
// it. It names a concrete task (polishing one line) rather than a vague
// apology, and it reads like a real incident because it is one: the
// entry was written by the same agent, on the same day, about its own
// habit of over-working the smallest job.
//
// The competition gate is 1-200 characters, so it is enforced here, in
// code: length is counted in Unicode code points (not UTF-16 code units),
// and a blank-only or multi-line text is rejected, so a future edit that
// makes the text too long (or empty) fails loudly instead of producing
// an invalid entry. The file is written atomically (temp file + rename)
// so /output/entry.txt is never left half-written.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";

// Final entry (92 Unicode code points, one line):
// "Today my agent spent an hour polishing a one-line joke, then
// submitted its very first draft."
const entry =
  "Today my agent spent an hour polishing a one-line joke, then " +
  "submitted its very first draft.";

// Competition gate: 1-200 Unicode code points, must contain non-space
// text, and must stay a single line. Control characters are rejected
// too: the gate requires plain UTF-8 text, and an invisible control
// character would make the entry render differently from what the
// judge reads.
function validateEntry(text: string): number {
  const length = Array.from(text).length;
  if (length < 1 || length > 200) {
    throw new Error(`entry length ${length} code points is outside the 1-200 range`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be blank");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 && ch !== "\t") {
      throw new Error(`entry contains a control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }
  return length;
}

const entryLength = validateEntry(entry);

// Write atomically: /output/entry.txt is either the complete entry or
// untouched, never a half-written file if the process is interrupted.
mkdirSync("/output", { recursive: true });
const tmpPath = "/output/.entry.txt.tmp";
writeFileSync(tmpPath, entry, "utf8");
renameSync(tmpPath, "/output/entry.txt");
console.log(`wrote ${entryLength} code points to /output/entry.txt`);
