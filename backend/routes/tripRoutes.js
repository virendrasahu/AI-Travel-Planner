const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth');

router.post('/', auth, tripController.generateNewTrip);
router.get('/', auth, tripController.fetchUserTrips);
router.get('/:id', auth, tripController.getTripById);
router.put('/:id', auth, tripController.updateTrip);
router.delete('/:id', auth, tripController.deleteTrip);
router.post('/:id/regenerate-day', auth, tripController.regenerateDay);

module.exports = router;
