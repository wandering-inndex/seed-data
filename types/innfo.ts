/** Corresponds to a single Web Volume Node. */
export interface WebVolumeNode {
  [key: string]: string | number;
  /** Unique ID for the Volume. Padded up to two zeroes to the left. */
  id: string;
  /** The index of the volume, starting with 1. */
  index: number;
  /** Official title of the Web Volume. */
  title: string;
}

/** Corresponds to a single Electronic Book Node. */
export interface ElectronicBookNode {
  [key: string]: string | number;
  /** Unique ID for the Volume. Padded up to two zeroes to the left. */
  id: string;
  /** The index of the book, starting with 1. */
  index: number;
  /** The title of the e-book release. */
  title: string;
}

/** Corresponds to a single Audio Book Node. */
export interface AudioBookNode {
  [key: string]: string | number;
  /** Unique ID for the Volume. Padded up to two zeroes to the left. */
  id: string;
  /** The index of the book, starting with 1. */
  index: number;
  /** The title of the e-book release. */
  title: string;
}

export interface RelationshipChapterPartOfMedia {
  label: "WebVolume" | "ElectronicBook" | "AudioBook";
  key: string;
}

/** Corresponds to a single Chapter Node. */
export interface ChapterNode {
  [key: string]: string | number | RelationshipChapterPartOfMedia[];
  /**
   * Unique ID for the chapter. Padded up to four zeroes to the left, and two
   * zeroes to the right to make it easier to move later when we get revised
   * chapters.
   */
  id: string;
  /** Permalink to the volume's wiki URL. */
  wikiUrl: string;

  /** The order in the web novel. */
  webNovelOrder: number;
  /** The title in the web novel. */
  webNovelTitle: string;
  /** The order in the electronic book releases. */
  eBookOrder: number;
  /** The title in the electronic book releases. */
  eBookTitle: string;
  /** The order in the audio book releases. */
  audioBookOrder: number;
  /** The title in the audio book releases. */
  audioBookTitle: string;

  /** Specifies if the Chapter is collected in a Media type. */
  PART_OF: RelationshipChapterPartOfMedia[];
}
