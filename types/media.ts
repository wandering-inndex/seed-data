/**
 * The different chapter types. Note that this will only be based on the
 * web version, as there are some chapters that have different types in the
 * ebooks and audiobooks.
 */
export enum ChapterType {
  /** Refers to regular chapters without letters in the title. */
  REGULAR = "REGULAR",
  /** Refers to regular chapters with letters in the title. */
  LETTERED = "LETTERED",
  /** Refers to interludes, as specified by the author. */
  INTERLUDE = "INTERLUDE",
  /** Refers to side stories, as specified by the author. */
  SIDE_STORY = "SIDE_STORY",
  /** Refers to mini stories, as specified by the author. */
  MINI_STORY = "MINI_STORY",
  /** Refers to other types, like the Guest Book or the Glossary. */
  OTHER = "OTHER",
}

/**
 * Related information specificing the chapter is part of the Web Novel release.
 */
export interface PartOfWebNovelData {
  /** The volume this is collected under. */
  ref: number | null;
  /** The "official" order of reading. */
  order: number | null;
  /** Title of the Chapter in the Web Novel. */
  title: string | null;
  /**
   * The timestamp when this chapter is originally published. This can be
   * found via the `meta[property='article:published_time']` selector.
   */
  published: string;
  /** Permalink to the chapter's URL. */
  url: string;
  /**
   * Total words based on https://wordcounter.net/. Without the title,
   * author's notes, artworks, etc.
   */
  totalWords: number | null;
}

/**
 * Related information specificing the chapter is part of the Electronic Book
 * release.
 */
export interface PartOfElectronicBookData {
  /** The e-book release this is collected under. */
  ref: number | null;
  /** Order based on the Table of Contents of each book. */
  order: number | null;
  /** Title of the Chapter in the e-book release. */
  title: string | null;
  /** Total pages from the Kindle table of contents. */
  totalPages: number | null;
}

/**
 * Related information specificing the chapter is part of the Audio Book
 * release.
 */
export interface PartOfAudioBookData {
  /** The audiobook release this is collected under. */
  ref: number | null;
  /** Order based on the Chapters List of each release. */
  order: number | null;
  /** Title of the Chapter in the audiobook release. */
  title: string | null;
  /** Total seconds from the Audible chapters list. */
  totalSeconds: number | null;
}

/** Related information specificing the chapter is part of the Wiki. */
export interface PartOfWikiData {
  /** Permalink to the chapter's wiki URL. */
  url: string | null;
}

/**
 * The Wandering Inn is released as Chapters, and is categorized into
 * overarching volumes (for the web novel) and books (for Kindle and Audible
 * releases).
 *
 * @see {@link https://wanderinginn.com/table-of-contents/}
 */
export interface Chapter {
  /**
   * Unique ID for the chapter. Padded up to four digits to the left, and three
   * digits to the right to make it easier to move later when we get revised
   * chapters.
   */
  id: string;
  /** Flags for the chapter. */
  meta: {
    /** The chapter type based on the web version. */
    chapterType: ChapterType;
    /** If true, then it will be marked as non-canon. */
    canon: boolean;
    /**
     * If true, then it will be marked as a rewrite. Note, this is not for
     * revised chapters with editors, but a complete rewrite (e.g. Volume 1
     * rewrites).
     */
    rewrite: boolean;
    /** If true, then it will be shown in the table of contents. */
    show: boolean;
  };
  /** Specifies that a chapter is part of a bigger collection. */
  partOf: {
    /** Part of a Web Novel Volume. */
    webNovel?: PartOfWebNovelData;
    /**
     * Part of a Web Novel Volume Rewrite.
     *
     * TODO(ncalub): I think it might be better to just merge it to `webNovel`.
     * Create a new Issue discussing this matter.
     */
    webNovelRewrite?: PartOfWebNovelData;
    /** Part of a Kindle e-book release. */
    eBook?: PartOfElectronicBookData;
    /** Part of an Audible audiobook release. */
    audioBook?: PartOfAudioBookData;
    /** Part of the wiki. */
    wiki?: PartOfWikiData;
  };
}

/** A collection of image URLs for the media type. */
export interface ImageUrls {
  /** The full size of the image. */
  original: string;
  /** The medium size of the image. Usually 400 pixels in size. */
  medium: string;
  /** The small size of the image. Usually 300 pixels in size. */
  small: string;
  /** The thumbnail size of the image. Usually 100 pixels in size. */
  thumbnail: string;
}

/**
 * Collection of chapters from the web novel.
 *
 * @see {@link https://thewanderinginn.fandom.com/wiki/Category:Volumes}
 */
export interface WebVolume {
  /** Unique ID for the Volume. Padded up to two zeroes to the left. */
  id: string;
  /** The index of the volume, starting with 1. */
  index: number;
  /** Official title of the Web Volume. */
  title: string;
  /** Permalink to the volume's wiki URL. */
  wikiUrl: string;
  /** The range of the chapter indexes covered. */
  range: {
    /** The index where this volume starts. Must be >= 1. */
    start: number;
    /**
     * An optional index where this volume ends. If null, then this is still an
     * ongoing volume. Must be >= 1 or null.
     */
    end: number | null;
  };
}

/**
 * Digital books published in Amazon Kindle.
 *
 * @see {@link https://www.amazon.com/dp/B099JFQ9YR}
 */
export interface ElectronicBook {
  /** Unique ID for the Volume. Padded up to two zeroes to the left. */
  id: string;
  /** The index of the book, starting with 1. */
  index: number;
  /** The title of the e-book release. */
  title: string;
  /** The official title in the store page. */
  storeTitle: string;
  /** Date string on when this e-book is published. */
  published: string;
  /** Permalink to the store URL. */
  storeUrl: string;
  /** The URLs for the available images. */
  imageUrls: ImageUrls;
  /** Total number of pages based on the store page. */
  totalLength: number | null;
  /** The range of the chapter indexes covered. */
  range: {
    /** The index where this book starts. Must be >= 1. */
    start: number;
    /**
     * An optional index where this book ends. If null, then the book end is yet
     * to be determined. Must be >= 1 or null.
     */
    end: number | null;
  };
}

/**
 * Audiobooks published in Audible. Narrated by Andrea Parsneau.
 *
 * @see {@link https://www.audible.com/series/The-Wandering-Inn-Audiobooks/B07X3TZ2YQ}
 */
export interface AudioBook {
  /** Unique ID for the Volume. Padded up to two zeroes to the left. */
  id: string;
  /** The index of the book, starting with 1. */
  index: number;
  /** The title of the e-book release. */
  title: string;
  /** The official title in the store page. */
  storeTitle: string;
  /** Date string on when this audiobook is published. */
  published: string;
  /** Permalink to the store URL. */
  storeUrl: string;
  /** The URLs for the available images. */
  imageUrls: ImageUrls;
  /** Total minutes based on the store page. */
  totalLength: number | null;
  /** The range of the chapter indexes covered. */
  range: {
    /** The index where this book starts. Must be >= 1. */
    start: number;
    /**
     * An optional index where this book ends. If null, then the book end is yet
     * to be determined. Must be >= 1 or null.
     */
    end: number | null;
  };
}
