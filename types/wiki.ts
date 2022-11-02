/** Corresponds to a single Wiki Article. */
export interface WikiArticle {
  /** Article ID from the Nirvana API. */
  id: number;
  /** Title of the article. */
  title: string;
  /** Permalink to the article. */
  url: string;
}
