/**
 * The Wandering Inn is released as Chapters, and is categorized into
 * overarching volumes (for the web novel) and books (for Kindle and Audible
 * releases).
 *
 * @see {@link https://wanderinginn.com/table-of-contents/}
 */
export interface Chapter {
  /**
   * Unique ID for the chapter. Padded up to four zeroes to the left, and two
   * zeroes to the right to make it easier to move later when we get revised
   * chapters.
   */
  id: string;
  /** Specifies that a chapter is part of a bigger collection. */
  partOf: {
    /** Part of a Web Novel Volume. */
    webNovel: {
      /** The volume this is collected under. */
      ref: number | null;
      /** Order based on the Table of Contents of the website. */
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
    };
    /** Part of a Kindle e-book release. */
    eBook: {
      /** The e-book release this is collected under. */
      ref: number | null;
      /** Order based on the Table of Contents of each book. */
      order: number | null;
      /** Title of the Chapter in the e-book release. */
      title: string | null;
      /** Total pages from the Kindle table of contents. */
      totalPages: number | null;
    };
    /** Part of an Audible audiobook release. */
    audioBook: {
      /** The audiobook release this is collected under. */
      ref: number | null;
      /** Order based on the Chapters List of each release. */
      order: number | null;
      /** Title of the Chapter in the audiobook release. */
      title: string | null;
      /** Total seconds from the Audible chapters list. */
      totalSeconds: number | null;
    };
    /** Part of the wiki. */
    wiki: {
      /** Permalink to the chapter's wiki URL. */
      url: string | null;
    };
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
