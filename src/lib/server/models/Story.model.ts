import mongoose, { Schema } from 'mongoose';

/**
 * Story Document Interface
 * Matches the frontend-nextjs Story model for compatibility
 */
export interface IStory {
  _id: string;
  slug: string;
  title: {
    en: string;
    th: string;
    [locale: string]: string;
  };
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  category: string;
  tags: string[];
  estimatedTime: number;
  totalWords: number;
  targetVocabulary: number;
  coverImageUrl: string;
  episodes: IEpisode[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEpisode {
  episodeNumber: number;
  title: {
    en: string;
    th: string;
  };
  pages: IPage[];
  vocabularyDetails: IVocabularyDetail[];
  miniGame: IMiniGame;
  status?: 'draft' | 'generated' | 'approved' | 'rejected';
  reviewNotes?: string;
}

export interface IVocabularyDetail {
  word: string;
  phonetic: string;
  pronunciations: Map<string, string>;
  translations: Map<string, string>;
  pos: string;
  example: string;
  exampleTranslations: Map<string, string>;
}

export interface IWordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface IPage {
  pageNumber: number;
  text: string;
  translations: Record<string, string>;
  vocabulary: IVocabularyHighlight[];
  audioUrl: string;
  imageUrl: string;
  wordTimestamps?: IWordTimestamp[];
}

export interface IVocabularyHighlight {
  word: string;
  highlight: boolean;
}

export interface IMiniGame {
  type: 'multipleChoice' | 'listening' | 'spelling' | 'contextFill' | 'wordMatch';
  questions: IQuestion[];
}

export interface IQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  audioUrl?: string;
}

// ==================== Sub-schemas ====================

const VocabularyHighlightSchema = new Schema<IVocabularyHighlight>(
  {
    word: { type: String, required: true },
    highlight: { type: Boolean, default: false },
  },
  { _id: false }
);

const WordTimestampSchema = new Schema<IWordTimestamp>(
  {
    word: { type: String, required: true },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
  },
  { _id: false }
);

const PageSchema = new Schema<IPage>(
  {
    pageNumber: { type: Number, required: true },
    text: { type: String, required: true },
    translations: { type: Map, of: String, default: {} },
    vocabulary: [VocabularyHighlightSchema],
    audioUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    wordTimestamps: { type: [WordTimestampSchema], default: [] },
  },
  { _id: false }
);

const VocabularyDetailSchema = new Schema<IVocabularyDetail>(
  {
    word: { type: String, required: true },
    phonetic: { type: String, default: '' },
    pronunciations: { type: Map, of: String },
    translations: { type: Map, of: String },
    pos: { type: String, default: '' },
    example: { type: String, default: '' },
    exampleTranslations: { type: Map, of: String },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    audioUrl: { type: String },
  },
  { _id: false }
);

const MiniGameSchema = new Schema<IMiniGame>(
  {
    type: {
      type: String,
      enum: ['multipleChoice', 'listening', 'spelling', 'contextFill', 'wordMatch'],
      required: true,
    },
    questions: [QuestionSchema],
  },
  { _id: false }
);

const EpisodeSchema = new Schema<IEpisode>(
  {
    episodeNumber: { type: Number, required: true },
    title: {
      en: { type: String, required: true },
      th: { type: String, required: true },
    },
    pages: [PageSchema],
    vocabularyDetails: [VocabularyDetailSchema],
    miniGame: MiniGameSchema,
    status: {
      type: String,
      enum: ['draft', 'generated', 'approved', 'rejected'],
      default: 'draft',
    },
    reviewNotes: { type: String, default: '' },
  },
  { _id: false }
);

// ==================== Main Story Schema ====================

const StorySchema = new Schema<IStory>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: {
      en: { type: String, required: true },
      th: { type: String, required: true },
    },
    language: { type: String, default: 'en' },
    level: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2'],
      required: true,
      index: true,
    },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    estimatedTime: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    targetVocabulary: { type: Number, default: 0 },
    coverImageUrl: { type: String, default: '' },
    episodes: [EpisodeSchema],
    viewCount: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
    collection: 'stories',
  }
);

/**
 * Get or create the Story model
 * Lazy-loads the model to avoid module-level env var checks
 */
function getStoryModel() {
  if (mongoose.models.Story) {
    return mongoose.models.Story;
  }

  return mongoose.model<IStory>('Story', StorySchema);
}

export default getStoryModel;
