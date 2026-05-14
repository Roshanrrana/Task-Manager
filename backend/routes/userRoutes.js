const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;
