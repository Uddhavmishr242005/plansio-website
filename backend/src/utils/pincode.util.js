/* Pincode Serviceability Check */
const https = require('https');

// Check India Post pincode API (free, no key needed)
exports.checkPincode = async (pincode) => {
  return new Promise((resolve) => {
    const url = `https://api.postalpincode.in/pincode/${pincode}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json[0]?.Status === 'Success') {
            const info = json[0].PostOffice?.[0];
            resolve({
              valid: true,
              city:  info?.District || info?.Block || '',
              state: info?.State || '',
              pincode,
              codAvailable: true, // You can add logic to block certain pincodes
              deliveryDays: 5     // Estimated delivery days
            });
          } else {
            resolve({ valid: false, message: 'Invalid pincode' });
          }
        } catch(e) {
          resolve({ valid: false, message: 'Could not verify pincode' });
        }
      });
    }).on('error', () => {
      // Fallback if API fails — accept all pincodes
      resolve({ valid: true, city: '', state: '', pincode, codAvailable: true, deliveryDays: 7 });
    });
  });
};
