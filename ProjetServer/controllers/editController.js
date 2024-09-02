const User = require('../models/user');
const fs = require('fs');
const path = require('path');


exports.boardPic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded.' });
        }

        // Assuming you have the user's email or some identifier in req.body.email
        const userEmail = req.body.email; // Adjust according to your actual request

        // Save image URL to user document in MongoDB
        const imageUrl = req.file.path; // This should be the path where multer stores the file

        const updatedUser = await User.findOneAndUpdate(
            { email: userEmail },
            { boardImage: imageUrl },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, message: 'Image URL saved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};


exports.addMessages = async (req, res) => {
    const { email, messages } = req.body;
    console.log("inside addMessages function");

    try {
        // Validate that 'messages' is an array
        if (!Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: 'Messages should be an array' });
        }

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Log existing and incoming messages
        console.log("Current messages:", user.messages);
        console.log("Messages to add:", messages);

        // Update user.messages with incoming messages, ensuring empty strings are saved
        for (let i = 0; i < 4; i++) {
            if (i < messages.length) {
                // Validate message format
                const message = messages[i];
                if (message.text === undefined || message.color === undefined) {
                    return res.status(400).json({ success: false, message: 'Message must have text and color' });
                }
                user.messages[i] = {
                    text: message.text =  message.text,
                    color: message.color = message.color
                };
            } else {
                user.messages[i] = { text: '', color: 'black' }; // Ensure empty slots are set to empty strings and default color
            }
        }

        // Log final messages to be saved
        console.log("Messages after update:", user.messages);

        // Save the updated user document
        const result = await User.updateOne(
            { email },
            { $set: { messages: user.messages } }
        );
        console.log("Save result:", result);

        // Respond with success message
        if (result.modifiedCount > 0) {
            res.status(200).json({ success: true, message: 'Messages added successfully' });
        } else {
            res.status(200).json({ success: false, message: 'No changes made' });
        }
    } catch (error) {
        console.error('Error adding messages:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
exports.getUserMessages = async (req, res) => {
    const { email } = req.query;
    console.log("inside the getUserMessages function");

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Assuming `user.messages` is an array of objects with `text` and `color`
        const messages = user.messages.map(msg => ({
            text: msg.text,
            color: msg.color
        }));

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
exports.getBoardImage = async (req, res) => {
    const { email } = req.body;
    console.log("email: " + email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("error user")
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const imageUrl = user.boardImage;
        if (!imageUrl) {
            console.log("error imageUrl")
            return res.status(404).json({ success: false, message: 'Board image not found' });
        }

        // Resolve path relative to 'public/BoardImages'
        const imagePath = path.resolve(__dirname, '..', imageUrl);
        
        // Check if the file exists
        if (!fs.existsSync(imagePath)) {
            console.log("error existsSync"+ imagePath)
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        console.log("in get image")
        // Send the image file path
        res.status(200).json({ success: true, imageUrl: imageUrl });
    } catch (error) {
        console.error(error);
        console.log("error  catch")
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.EditeUserBoxes = async (req, res) => {
    const { username, boxes } = req.body;
  
    try {
      // Find the user by username
      console.log("the user name is " + username);
      const user = await User.findOne({ username });
      console.log("in the updateUserBoxes function");
      if (!user) {
        console.log("user not found");
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Validate each box object
      for (let i = 0; i < boxes.length; i++) {
        console.log("box number " + i);
  
        const { x, y, width, height } = boxes[i];
        if (x === undefined || y === undefined || width === undefined || height === undefined) {
          return res.status(400).json({ success: false, message: `Invalid box data at index ${i}` });
        }
      }
  
      // Update the user's boxes field with the new array of boxes
      user.boxes = boxes.map(box => ({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      }));
    

      //Removing the template after the user Edit
      user.template = null;
  
      console.log("before save");
      await user.save();
      console.log("after save");
  
      res.json({ success: true, message: 'User boxes updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  exports.notifyTVAppUpdate = async (req,res) =>{
    const { username } = req.body;

    try {
        // Update status for the user to indicate an update
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.updatePending = true; // Add a flag to indicate updates are pending
        await user.save();

        res.json({ success: true, message: 'TV app notified' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  exports.checkForUpdates = async (req,res) =>{
    const { email } = req.query;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ updateAvailable: false, message: 'User not found' });
        }

        res.json({ updateAvailable: user.updatePending });
        user.updatePending =false;
        user.save();
    } catch (err) {
        console.error(err);
        res.status(500).json({ updateAvailable: false, message: 'Server error' });
    }
  };

  exports.saveMainBackground = async (req, res) => {
    // Log the raw request body
    console.log("Raw Request Body:", req.rawBody);
    console.log("Request Body:", req.body); // Log the parsed request body

    try {
        const { username, color } = req.body;

        // Validate input
        if (typeof username !== 'string' || username.trim() === '') {
            return res.status(400).send('Invalid or missing username');
        }

        // Validate that color is a number
        if (typeof color !== 'string') {
            return res.status(400).send('Invalid or missing color');
        }

        // Check if user exists
        const userExists = await User.findOne({ username: username });
        if (!userExists) {
            return res.status(404).send('User not found');
        }

        // Update the user's background color
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: { backgroundColor: color } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).send('Error updating background color');
        }

        res.status(200).send('Background color updated successfully');
    } catch (error) {
        console.error('Error updating background color:', error);
        res.status(400).send(`Error updating background color: ${error.message}`);
    }
};

exports.logoutFromTv = async (req,res) => {
    try {
        // Extract email from request body
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find the user and update the logoutFromTV field
        const user = await User.findOneAndUpdate(
            { email: email }, // Find user by email
            { $set: { logOutTV: true } }, // Update logOutTV to true
            { new: true } // Return the updated document
        );

        if (user) {
            res.status(200).json({ message: 'User logged out from TV successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error logging out user from TV:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkTvLogged = async (req,res)=>{
    try {
        // Extract email from request body
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find the user and check the logOutTV field
        const user = await User.findOne({ email: email });

        if (user) {
            // Send back the logOutTV status
            res.status(200).json({ logOutTV: user.logOutTV });

            user.logOutTV = false;
            user.save();
            
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error checking logout status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add this function in your editController.js
exports.getUserMainBackgroundColor = async (req, res) => {
    console.log("in the getUserMainBackgroundColor function");
    const { email } = req.query; // Fetch username from query parameters

    console.log("Received request to get background color");
    console.log("Query parameters:", req.query);

    if (!email) {
        console.error('email is missing in the request');
        return res.status(400).send('email is required');
    }

    try {
        console.log('Fetching user from database with email:', email);

        const user = await User.findOne({ email: email });// Select only the backgroundColor field

        if (!user) {
            console.error('User not found for username:', username);
            return res.status(404).send('User not found');
        }

        console.log('User found. Background color:', user.backgroundColor);

        res.status(200).json({ backgroundColor: user.backgroundColor });
    } catch (error) {
        console.error('Error fetching user background color:', error.message);
        res.status(500).send('Error fetching user background color');
    }
};







  exports.getUserBoxes = async (req, res) => {
    const { email } = req.query;  // Extract the username from the query parameters

    try {
        console.log("in getUserBoxes func");
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const boxes = user.boxes;
        console.log("sent the json file in getUserBoxes func");
        res.status(200).json({ success: true, boxes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.saveTemplate = async (req,res)=>{
    const {username,templateId} = req.body;

    const user = await User.findOne({username});
    if(!user){
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.template = templateId;
    user.save();
    res.status(200).json({success: true});
}
exports.getTemplate=async (req, res) => {
    const { username } = req.query;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const templateId = user.template || 'NULL';
        res.status(200).json({ success: true, template: templateId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.saveApi = async (req, res) => {
    const { username, selectedApis } = req.body;
    console.log("inside saveApi");
    console.log("the APIs are " + JSON.stringify(selectedApis) + " of user name " + username);

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prepare the API array
        let apiArray = [];

        if (Array.isArray(selectedApis)) {
            // Ensure the array has a maximum of 2 APIs
            apiArray = selectedApis.slice(0, 2);
            // Add null if the array has fewer than 2 elements
            while (apiArray.length < 2) {
                apiArray.push(null);
            }
        } else if (typeof selectedApis === 'string') {
            // If a single API string is provided, set the other slot as null
            apiArray = [selectedApis, null];
        }

        // Save the API array to the user's record
        user.api = apiArray;
        await user.save();

        // Log the API IDs saved
        console.log(`APIs '${apiArray}' have been saved for user '${username}'`);

        // Respond with success
        res.status(200).json({ success: true, message: `APIs '${apiArray}' have been saved` });

    } catch (error) {
        // Log the error
        console.error('Error saving API IDs:', error);

        // Respond with error
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



exports.getApi = async (req, res) => {
    const { username } = req.query;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        
        if (!user) {
            // Log and respond with user not found
            console.log(`User '${username}' not found`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get the selected APIs from the user's record
        const selectedApi = user.api || 'NULL';  // If no API is found, return 'NULL'

        // Log the retrieved API information
        console.log(`User '${username}' has selected APIs: '${selectedApi}'`);

        // Respond with the selected APIs
        res.status(200).json({ success: true, api: selectedApi });
        
    } catch (error) {
        // Log the error
        console.error('Error retrieving selected APIs:', error);

        // Respond with a server error
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

  