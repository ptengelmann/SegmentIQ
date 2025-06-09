// server/routes/profiles.js
import express from 'express';
import {
   uploadProfiles,
   getProfiles,
   getProfileById,
   updateProfile,  // ADD THIS
   deleteProfile,
  getProfileFields
} from '../controllers/profiles.js';
// import { authenticate, authorize } from '../middleware/auth.js'; // Comment this out

const router = express.Router();

// router.use(authenticate); // Comment this out temporarily
// router.delete('/:id', authorize('admin'), deleteProfile); // Comment this out

router.post('/upload', uploadProfiles);
router.get('/', getProfiles);
router.get('/fields', getProfileFields);
router.get('/:id', getProfileById);
router.put('/:id', updateProfile);  // ADD THIS LINE
router.delete('/:id', deleteProfile); // Keep this but without auth for now

export default router;