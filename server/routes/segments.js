// server/routes/segments.js
import express from 'express';
import { 
  createSegment, 
  getSegments, 
  getSegmentById, 
  updateSegment,
  deleteSegment,
  previewSegment  // ADD THIS IMPORT
} from '../controllers/segments.js';

const router = express.Router();

router.post('/', createSegment);
router.post('/preview', previewSegment);  // ADD THIS LINE
router.get('/', getSegments);
router.get('/:id', getSegmentById);
router.put('/:id', updateSegment);
router.delete('/:id', deleteSegment);

export default router;