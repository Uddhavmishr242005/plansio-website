const router = require('express').Router();
const { checkPincode } = require('../utils/pincode.util');

// GET /api/v1/pincode/check/:pincode
router.get('/check/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!/^\d{6}$/.test(pincode))
      return res.status(400).json({ success: false, message: 'Invalid pincode format' });

    const result = await checkPincode(pincode);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
