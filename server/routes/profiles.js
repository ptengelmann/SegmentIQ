// server/routes/profiles.js
import express from 'express';
import { 
  uploadProfiles, 
  getProfiles, 
  getProfileById, 
  deleteProfile,
  getProfileFields
} from '../controllers/profiles.js';

const router = express.Router();

router.post('/upload', uploadProfiles);
router.get('/', getProfiles);
router.get('/fields', getProfileFields);
router.get('/:id', getProfileById);
router.delete('/:id', deleteProfile);

export default router;