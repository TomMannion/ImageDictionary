import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { optimizeImage } from '../services/imageService';
import { fetchImageFromUrl } from '../services/urlImageService';
import { generateReading } from '../services/readingService';
import path from 'path';

// Get all entries with search and filtering
export const getEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      query,
      tags,
      jlptLevel,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (query) {
      where.OR = [
        { word: { contains: query as string, mode: 'insensitive' } },
        { reading: { contains: query as string, mode: 'insensitive' } },
        { romaji: { contains: query as string, mode: 'insensitive' } },
        { translation: { contains: query as string, mode: 'insensitive' } }
      ];
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = { hasSome: tagArray };
    }

    if (jlptLevel) {
      where.jlptLevel = parseInt(jlptLevel as string);
    }

    // Get total count
    const total = await prisma.entry.count({ where });

    // Get entries
    const entries = await prisma.entry.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: entries,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

// Get single entry
export const getEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        relatedFrom: {
          include: {
            toEntry: true
          }
        }
      }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Transform relatedFrom to relatedEntries format
    const relatedEntries = entry.relatedFrom.map(rel => ({
      position: rel.position,
      entry: rel.toEntry
    }));

    res.json({ ...entry, relatedEntries });
  } catch (error) {
    next(error);
  }
};

// Create entry
export const createEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { word, reading, romaji, translation, notes, definition, tags, jlptLevel, cropData } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Parse crop data if provided
    const parsedCropData = cropData ? JSON.parse(cropData) : undefined;

    // Optimize image with optional crop
    const optimizedPath = await optimizeImage(req.file.path, parsedCropData);
    const imageUrl = `/uploads/${path.basename(optimizedPath)}`;

    // Parse tags if it's a string
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    const entry = await prisma.entry.create({
      data: {
        imageUrl,
        word,
        reading,
        romaji: romaji || null,
        translation: translation || null,
        notes: notes || null,
        definition: definition || null,
        tags: parsedTags || [],
        jlptLevel: jlptLevel ? parseInt(jlptLevel) : null
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

// Helper function to convert empty strings to null for optional fields
const toNullableString = (value: string | undefined, fallback: string | null): string | null => {
  if (value === undefined) return fallback;
  return value.trim() || null;
};

// Update entry
export const updateEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { word, reading, romaji, translation, notes, definition, tags, jlptLevel, cropData } = req.body;

    // Fetch existing entry
    const entry = await prisma.entry.findUnique({ where: { id } });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Validate required word field
    if (word !== undefined && !word.trim()) {
      return res.status(400).json({ error: 'Word cannot be empty' });
    }

    // Handle image update
    let imageUrl = entry.imageUrl;
    if (req.file) {
      const parsedCropData = cropData ? JSON.parse(cropData) : undefined;
      const optimizedPath = await optimizeImage(req.file.path, parsedCropData);
      imageUrl = `/uploads/${path.basename(optimizedPath)}`;
    }

    // Parse and validate tags
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

    // Parse and validate JLPT level
    let parsedJlptLevel = entry.jlptLevel;
    if (jlptLevel !== undefined) {
      if (jlptLevel === '' || jlptLevel === null) {
        parsedJlptLevel = null;
      } else {
        const level = parseInt(jlptLevel);
        if (isNaN(level) || level < 1 || level > 5) {
          return res.status(400).json({ error: 'JLPT level must be between 1 and 5' });
        }
        parsedJlptLevel = level;
      }
    }

    // Update entry with cleaned data
    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        imageUrl,
        word: word !== undefined ? word.trim() : entry.word,
        reading: toNullableString(reading, entry.reading),
        romaji: toNullableString(romaji, entry.romaji),
        translation: toNullableString(translation, entry.translation),
        notes: toNullableString(notes, entry.notes),
        definition: toNullableString(definition, entry.definition),
        tags: tags !== undefined ? (parsedTags || []) : entry.tags,
        jlptLevel: parsedJlptLevel
      }
    });

    res.json(updatedEntry);
  } catch (error) {
    next(error);
  }
};

// Delete entry
export const deleteEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const entry = await prisma.entry.findUnique({ where: { id } });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await prisma.entry.delete({ where: { id } });

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all unique tags
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await prisma.entry.findMany({
      select: { tags: true }
    });

    const allTags = entries.flatMap(entry => entry.tags);
    const uniqueTags = [...new Set(allTags)].sort();

    res.json(uniqueTags);
  } catch (error) {
    next(error);
  }
};

// Get relations for an entry
export const getRelations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const relations = await prisma.entryRelation.findMany({
      where: { fromEntryId: id },
      include: { toEntry: true },
      orderBy: { position: 'asc' }
    });

    const relatedEntries = relations.map(rel => ({
      position: rel.position,
      entry: rel.toEntry
    }));

    res.json(relatedEntries);
  } catch (error) {
    next(error);
  }
};

// Update relations for an entry
export const updateRelations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { relations } = req.body; // Array of { position: number, toEntryId: string }

    // Verify entry exists
    const entry = await prisma.entry.findUnique({ where: { id } });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Delete existing relations
    await prisma.entryRelation.deleteMany({
      where: { fromEntryId: id }
    });

    // Create new relations
    if (relations && relations.length > 0) {
      await prisma.entryRelation.createMany({
        data: relations.map((rel: any) => ({
          fromEntryId: id,
          toEntryId: rel.toEntryId,
          position: rel.position
        }))
      });
    }

    // Fetch and return updated relations
    const updatedRelations = await prisma.entryRelation.findMany({
      where: { fromEntryId: id },
      include: { toEntry: true },
      orderBy: { position: 'asc' }
    });

    const relatedEntries = updatedRelations.map(rel => ({
      position: rel.position,
      entry: rel.toEntry
    }));

    res.json(relatedEntries);
  } catch (error) {
    next(error);
  }
};

// Fetch image from URL
export const fetchImageFromURL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Fetch the image from URL
    const tempPath = await fetchImageFromUrl(imageUrl);

    // Return the filename so frontend can use it
    const filename = path.basename(tempPath);
    res.json({ filename, path: tempPath });
  } catch (error) {
    console.error('Error fetching image from URL:', error);
    next(error);
  }
};

// Generate reading from Japanese text
export const generateReadingFromText = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const reading = await generateReading(text);
    res.json({ reading });
  } catch (error) {
    console.error('Error generating reading:', error);
    next(error);
  }
};
