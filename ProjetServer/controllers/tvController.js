const xml2js = require('xml2js'); // Import xml2js
const axios = require('axios');

exports.getNews = async (req,res)=>{
    try {
        const response = await axios.get(
          'http://www.ynet.co.il/Integration/StoryRss1854.xml'
        );
        const xml = response.data;
    
        // Parse the XML to JSON
        xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
          if (err) {
            return res.status(500).send('Error parsing XML');
          }
    
          // Extract titles from the items
          const titles = result.rss.channel.item.map((item) => item.title);
    
          res.status(200).json({ titles }); // Send the titles as JSON
        });
    } catch (error) {
        res.status(500).send('Error fetching RSS feed');
    } 
}