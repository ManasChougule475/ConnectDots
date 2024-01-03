// controllers/instagramController.js
const fetch = require('node-fetch');s

const IG_APP_ID = 'YOUR_INSTAGRAM_APP_ID';
const IG_APP_SECRET = 'YOUR_INSTAGRAM_APP_SECRET';
const IG_USER_ACCESS_TOKEN = 'USER_ACCESS_TOKEN'; // Should be obtained properly



exports.reels = async (req, res) => {
  try {
    // Fetch user's reels using the Instagram Basic Display API
    const reelsData = await fetch(`https://graph.instagram.com/v12.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${IG_USER_ACCESS_TOKEN}`);
    const reels = await reelsData.json();
    
    res.render('reels', { reels });
  } catch (error) {

    console.error(error);
    res.status(500).send('Error fetching reels');
  }
};



// exports.reels = async (req, res) => {
//   try {
//     const { page = 1 } = req.query;
//     const reelsPerPage = 10; // Number of reels per page

//     // Calculate the offset based on the current page
//     const offset = (page - 1) * reelsPerPage;

//     // Fetch user's reels using the Instagram Basic Display API with pagination
//     const reelsData = await fetch(`https://graph.instagram.com/v12.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${IG_USER_ACCESS_TOKEN}&limit=${reelsPerPage}&offset=${offset}`);
//     const reels = await reelsData.json();

//     res.json({ reels }); // Send the reels data as JSON to be loaded via AJAX

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error fetching reels' });
//   }
// };
