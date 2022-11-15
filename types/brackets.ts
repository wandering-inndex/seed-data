/** Indicates a single [Bracket Content]. */
export type BracketContent = string;

/** A Chapter with a list of all mentioned BracketContents. */
export interface MentionedBracketContentsPerChapter {
  /** The Chapter ID. */
  id: string;
  /** A list of all the bracket contents mentioned. */
  mentions: BracketContent[];
}
