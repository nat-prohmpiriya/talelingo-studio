import { StoryRepository } from '$lib/server/repositories/Story.repository';
import type { IStory } from '$lib/server/models/Story.model';

/**
 * Story creation input from frontend
 */
export interface CreateStoryInput {
  titleEn: string;
  titleTh?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  category: string;
  episodeCount: number;
  artStyle?: string;
}

/**
 * Story Service - Business Logic Layer
 * Handles validation, AI generation coordination, and business rules
 */
export class StoryService {
  /**
   * Get all stories with pagination
   */
  static async getAllStories(params: {
    page?: number;
    limit?: number;
    level?: string;
    category?: string;
  }) {
    const { page = 1, limit = 20, level, category } = params;
    const offset = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (level) filter.level = level;
    if (category) filter.category = category;

    return StoryRepository.findPaginated(filter, { limit, offset });
  }

  /**
   * Get story by slug
   */
  static async getStoryBySlug(slug: string): Promise<IStory | null> {
    return StoryRepository.findBySlug(slug);
  }

  /**
   * Get story by ID
   */
  static async getStoryById(id: string): Promise<IStory | null> {
    return StoryRepository.findById(id);
  }

  /**
   * Create a new story (draft)
   */
  static async createStory(input: CreateStoryInput): Promise<IStory> {
    const { titleEn, titleTh = '', level, category, episodeCount, artStyle } = input;

    // Generate slug from title
    const slug = this.generateSlug(titleEn, level);

    // Check if slug already exists
    const exists = await StoryRepository.slugExists(slug);
    if (exists) {
      throw new Error(`Story with slug "${slug}" already exists`);
    }

    // Create story with draft content
    const storyData: Partial<IStory> = {
      slug,
      title: { en: titleEn, th: titleTh },
      language: 'en',
      level,
      category,
      tags: this.generateTags(category, level),
      estimatedTime: 0,
      totalWords: 0,
      targetVocabulary: 0,
      coverImageUrl: '',
      episodes: [],
      viewCount: 0,
    };

    const story = await StoryRepository.create(storyData);
    return story;
  }

  /**
   * Update story
   */
  static async updateStory(slug: string, data: Partial<IStory>): Promise<IStory | null> {
    // Don't allow direct episode updates through this method
    // Use specific episode update methods instead
    if (data.episodes) {
      throw new Error('Use updateEpisode method to modify episodes');
    }

    return StoryRepository.updateBySlug(slug, data);
  }

  /**
   * Delete story
   */
  static async deleteStory(slug: string): Promise<IStory | null> {
    return StoryRepository.deleteBySlug(slug);
  }

  /**
   * Generate a unique slug from title and level
   */
  private static generateSlug(title: string, level: string): string {
    // Convert title to slug format
    const slugTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    return `story-${level.toLowerCase()}-${slugTitle}`;
  }

  /**
   * Generate tags from category and level
   */
  private static generateTags(category: string, level: string): string[] {
    const tags = [category.toLowerCase()];

    // Add category-specific tags
    const categoryTags: Record<string, string[]> = {
      fable: ['animals', 'moral', 'lesson'],
      fairy: ['fantasy', 'magic', 'adventure'],
      mystery: ['detective', 'puzzle', 'thriller'],
      romance: ['love', 'relationship', 'emotion'],
      fantasy: ['magic', 'creatures', 'adventure'],
      daily: ['life', 'everyday', 'realistic'],
    };

    if (categoryTags[category.toLowerCase()]) {
      tags.push(...categoryTags[category.toLowerCase()]);
    }

    // Add level tag
    tags.push(level.toLowerCase());

    return tags;
  }

  /**
   * Get statistics
   */
  static async getStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const [total, storiesByLevel, storiesByCategory] = await Promise.all([
      StoryRepository.count(),
      this.countByLevel(),
      this.countByCategory(),
    ]);

    return {
      total,
      byLevel: storiesByLevel,
      byCategory: storiesByCategory,
    };
  }

  /**
   * Count stories by level
   */
  private static async countByLevel(): Promise<Record<string, number>> {
    const levels: Array<'A1' | 'A2' | 'B1' | 'B2'> = ['A1', 'A2', 'B1', 'B2'];
    const counts: Record<string, number> = {};

    for (const level of levels) {
      counts[level] = await StoryRepository.count({ level });
    }

    return counts;
  }

  /**
   * Count stories by category
   */
  private static async countByCategory(): Promise<Record<string, number>> {
    const categories = ['Fable', 'Fairy', 'Mystery', 'Romance', 'Fantasy', 'Daily'];
    const counts: Record<string, number> = {};

    for (const category of categories) {
      counts[category] = await StoryRepository.count({ category });
    }

    return counts;
  }
}

export default StoryService;
