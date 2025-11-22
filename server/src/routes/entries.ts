import express from 'express';
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getTags,
  getRelations,
  updateRelations,
  fetchImageFromURL,
  generateReadingFromText
} from '../controllers/entryController';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getEntries);
router.get('/tags', getTags);
router.post('/fetch-image', fetchImageFromURL);
router.post('/generate-reading', generateReadingFromText);
router.get('/:id', getEntry);
router.get('/:id/relations', getRelations);
router.post('/', upload.single('image'), createEntry);
router.put('/:id', upload.single('image'), updateEntry);
router.put('/:id/relations', updateRelations);
router.delete('/:id', deleteEntry);

export default router;
