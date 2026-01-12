import dbConnect from '$lib/server/db/mongodb';
import getStoryModel, { IStory } from '$lib/server/models/Story.model';

type StoryFilter = Partial<Pick<IStory, 'level' | 'category' | 'language'>> & Record<string, unknown>;

/**
 * Story Repository - Database Operations Layer
 * All MongoDB queries go through this layer
 */
export class StoryRepository {
  /**
   * Ensure database connection
   */
  private static async connect() {
    await dbConnect();
  }

  /**
   * Find stories with pagination and filters
   */
  static async findPaginated(
    filter: StoryFilter = {},
    options: { limit?: number; offset?: number; sort?: Record<string, 1 | -1> } = {}
  ) {
    await this.connect();

    const { limit = 20, offset = 0, sort = { createdAt: -1 } } = options;

    const [stories, total] = await Promise.all([
      getStoryModel().find(filter)
        .select('slug title level category coverImageUrl estimatedTime episodes createdAt')
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .lean(),
      getStoryModel().countDocuments(filter),
    ]);

    return {
      stories,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Find story by slug
   */
  static async findBySlug(slug: string): Promise<IStory | null> {
    await this.connect();
    return getStoryModel().findOne({ slug }).lean();
  }

  /**
   * Find story by ID
   */
  static async findById(storyId: string): Promise<IStory | null> {
    await this.connect();
    return getStoryModel().findById(storyId).lean();
  }

  /**
   * Create a new story
   */
  static async create(data: Partial<IStory>): Promise<IStory> {
    await this.connect();
    const story = await getStoryModel().create(data);
    return story.toObject();
  }

  /**
   * Update story by slug
   */
  static async updateBySlug(slug: string, data: Partial<IStory>): Promise<IStory | null> {
    await this.connect();
    const story = await getStoryModel().findOneAndUpdate({ slug }, data, { new: true }).lean();
    return story;
  }

  /**
   * Update story by ID
   */
  static async updateById(id: string, data: Partial<IStory>): Promise<IStory | null> {
    await this.connect();
    const story = await getStoryModel().findByIdAndUpdate(id, data, { new: true }).lean();
    return story;
  }

  /**
   * Delete story by slug
   */
  static async deleteBySlug(slug: string): Promise<IStory | null> {
    await this.connect();
    const story = await getStoryModel().findOneAndDelete({ slug }).lean();
    return story;
  }

  /**
   * Delete story by ID
   */
  static async deleteById(id: string): Promise<IStory | null> {
    await this.connect();
    const story = await getStoryModel().findByIdAndDelete(id).lean();
    return story;
  }

  /**
   * Get new releases (latest stories)
   */
  static async findNewReleases(limit: number = 5) {
    await this.connect();
    return getStoryModel().find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('slug title level category coverImageUrl estimatedTime totalWords createdAt')
      .lean();
  }

  /**
   * Get popular stories by view count
   */
  static async findPopular(limit: number = 5) {
    await this.connect();
    return getStoryModel().find({})
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(limit)
      .select('slug title level category coverImageUrl estimatedTime totalWords viewCount')
      .lean();
  }

  /**
   * Increment view count for a story
   */
  static async incrementViewCount(slug: string): Promise<IStory | null> {
    await this.connect();
    return getStoryModel().findOneAndUpdate(
      { slug },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();
  }

  /**
   * Find multiple stories by IDs
   */
  static async findByIds(storyIds: string[]) {
    await this.connect();
    return getStoryModel().find({ _id: { $in: storyIds } })
      .select('slug title level category coverImageUrl estimatedTime totalWords episodes')
      .lean();
  }

  /**
   * Check if slug exists
   */
  static async slugExists(slug: string): Promise<boolean> {
    await this.connect();
    const count = await getStoryModel().countDocuments({ slug });
    return count > 0;
  }

  /**
   * Count stories by filter
   */
  static async count(filter: StoryFilter = {}): Promise<number> {
    await this.connect();
    return getStoryModel().countDocuments(filter);
  }

  /**
   * Update an episode within a story
   * @param storyId - Story slug or MongoDB _id
   * @param episodeNumber - Episode number to update
   * @param status - New status for the episode
   * @param reviewNotes - Optional review notes
   */
  static async updateEpisode(
    storyId: string,
    episodeNumber: number,
    status: string,
    reviewNotes?: string
  ): Promise<IStory | null> {
    await this.connect();

    // Try to find by slug first, then by _id
    let story = await getStoryModel().findOne({ slug: storyId });
    if (!story) {
      story = await getStoryModel().findById(storyId);
    }

    if (!story) {
      return null;
    }

    // Find and update the specific episode
    const episodeIndex = story.episodes.findIndex(
      (ep) => ep.episodeNumber === episodeNumber
    );

    if (episodeIndex === -1) {
      return null;
    }

    // Update episode fields
    story.episodes[episodeIndex].status = status as any;
    if (reviewNotes !== undefined) {
      story.episodes[episodeIndex].reviewNotes = reviewNotes;
    }

    // Save the story
    await story.save();

    return story.toObject();
  }
}

export default StoryRepository;
