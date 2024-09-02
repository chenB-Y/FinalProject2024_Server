const bcrypt = require('bcrypt');
const User = require('../models/user');
const path = require('path');
const Session = require('../models/Session');
const Box=require('../models/boxes');
let activeSessions = {};
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid file name collisions
  }
});

const upload = multer({ storage: storage });



exports.registerUser = async (req, res) => {
  const { username, email, password, name, buildingAddress,city, devicesCount, floorsCount } = req.body;
  const profileImage = req.file ? `/images/${req.file.filename}` : null; // Get uploaded file name
  const saltRounds = 10;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with image URL included
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
      buildingAddress,
      city,
      devicesCount,
      floorsCount,
      profileImage // Save image URL in MongoDB
    });

    // Save the user to MongoDB
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkLogged = async (req, res) => {
  const { username } = req.body;
  

  try {
    // Find session by email
    const session = await Session.findOne({ username });

    if (session.username == username) {
      res.json({ isLoggedIn: true, username: session.username });
    } else {
      res.json({ isLoggedIn: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}




exports.loginUser = async (req, res) => {
  const { email, password, phoneSize } = req.body;
  console.log("login active");
  try {
      // Find the user by email
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Save the user's session to MongoDB
      const session = new Session({
          userId: user._id,
          username: user.username,
      });
      await session.save();
    
       /* console.log(user.phoneSize[0].inches+" "+phoneSize.inches );
        // Check if the new phoneSize is different from the existing one
        const currentPhoneSize = user.phoneSize[0] || {}; // get the current phoneSize if it exists
        const isDifferent = currentPhoneSize.inches !== phoneSize.inches || 
                             currentPhoneSize.width !== phoneSize.width || 
                            currentPhoneSize.height !== phoneSize.height;
 
        if (isDifferent) {
           console.log(`Old phone size: ${currentPhoneSize.inches}, New phone size: ${phoneSize.inches}`);
           user.phoneSize = [phoneSize];
           await user.save();
        }*/
      res.json({ success: true, username: user.username , city: user.city });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error.' });
  }
};



// Function to check if a token is valid
exports.isAuthenticated = (req, res) => {
    const username = req.body.username;
    if (!username || !activeSessions[username]) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    res.json({ success: true, user: activeSessions[username] });
};


// Function to log out a user
exports.logoutUser = async (req, res) => {
  const username = req.body.username;
  try {
      const session = await Session.findOneAndDelete({ username });

      if (session) {
          return res.json({ success: true, message: 'Logged out successfully.' });
      } else {
          res.status(400).json({ success: false, message: 'Invalid username or already logged out.' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUserIdIfLoggedIn = async (req, res) => {
  const { username } = req.body;

  try {
      // Find session by username
      const session = await Session.findOne({ username });

      if (session && session.username === username) {
          const user = await User.findOne({ username });
          if (user) {
              res.json({ success: true, userId: user._id });
          } else {
              res.status(404).json({ success: false, message: 'User not found' });
          }
      } else {
          res.status(401).json({ success: false, message: 'User not logged in' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.updateProfile = async (req, res) => {
  console.log("inside the updateProfile function");
  console.log(req.body);
  const saltRounds = 10;
  try {
    // Handle file upload
      const { username, email,  buildingAddress, city, devicesCount, floorsCount } = req.body;
      // Find the user by email (or another unique identifier)
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send('User not found');
      }
      // Update user profile
      user.username = username || user.username;
      user.password = ((await bcrypt.hash(password,saltRounds)) || (user.password));
      user.buildingAddress = buildingAddress || user.buildingAddress;
      user.city = city || user.city;
      user.devicesCount = devicesCount || user.devicesCount;
      user.floorsCount = floorsCount || user.floorsCount;
      
      // Handle profile image
      if (req.file) {
        console.log(req.file.path);
        user.profileImage = req.file.path;
      }
      // Save the updated user profile
      await user.save();
      res.status(200).send('Profile updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.checkBeforeReset = async (req,res)=>{
  const { email, username } = req.body;

  try {
      const user = await User.findOne({ email, username });
      if (user) {
          res.status(200).json({ message: 'User validated' });
      } else {
          res.status(400).json({ message: 'Invalid email or username' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
}

exports.reset = async (req,res)=>{
  const { email, newPassword } = req.body;

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find user and update password
        const result = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true } // Return the updated document
        );

        if (result) {
            res.status(200).json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ message: 'Failed to update password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

exports.getProfileData = async (req,res) =>{
  const email = req.query.email;

    try {
        // Find the user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Send the needed data
        res.json({
            buildingAddress: user.buildingAddress,
            devicesCount: user.devicesCount,
            floorsCount: user.floorsCount,
            profileImage: user.profileImage,
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};





exports.activeSessions;