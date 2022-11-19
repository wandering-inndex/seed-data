import { Integer, Node, Relationship } from "neo4j";

/** The properties for a single Chapter Node. */
export interface ChapterNodeProperties {
  id: string;
  metaChapterType: string;
  metaShow: boolean;
  webNovelTitle: string;
  webNovelOrder: number;
  webNovelWords: number;
  eBookOrder: number;
  audioBookOrder: number;
}

/** Represents a single Chapter Node. */
export type ChapterNode = Node<Integer, ChapterNodeProperties>;

/**
 * Represents a relationship between a Chapter Node and a Media Node
 * (WebVolume, ElectronicBook, and AudioBook).
 */
export type PartOfRelationship = Relationship<Integer>;

/** The properties for a single WebVolume Node. */
export interface WebVolumeNodeProperties {
  id: string;
  index: number;
  title: string;
}

/** Represents a single WebVolume Node. */
export type WebVolumeNode = Node<Integer, WebVolumeNodeProperties>;

/** The properties for a single ElectronicBook Node. */
export interface ElectronicBookNodeProperties {
  id: string;
  index: number;
  title: string;
}

/** Represents a single ElectronicBook Node. */
export type ElectronicBookNode = Node<Integer, ElectronicBookNodeProperties>;

/** The properties for a single AudioBook Node. */
export interface AudioBookNodeProperties {
  id: string;
  index: number;
  title: string;
}

/** Represents a single AudioBook Node. */
export type AudioBookNode = Node<Integer, AudioBookNodeProperties>;

/** The properties for a single Bracket Content Node. */
export interface BracketContentNodeProperties {
  id: string;
  content: string;
}

/** Represents a single BracketContent Node. */
export type BracketContentNode = Node<Integer, BracketContentNodeProperties>;

/**
 * Represents a relationship between a BracketContent Node and a Chapter Node.
 */
export type MentionedInRelationship = Relationship<Integer>;
