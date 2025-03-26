const passport=require('passport')
const googleStratigy=require("passport-google-oauth20")
const mongo=require('../mongodb/mongo')
passport.use(
  new googleStratigy(
    {
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      const db = await mongo();
      const existingUser = await db.collection('users').findOne({ gid: profile.id });
      console.log(JSON.stringify(profile, null, 2));

      if (existingUser) {
       
        done(null, existingUser); // Pass the existing user to Passport
      } else {
        const newUser = { 
          gid: profile.id, 
          name: profile.displayName,
          profilepic: profile.photos[0].value,
          list: true, // Set list to true to prevent redirect to ban page
          createdAt: new Date()
        };
        const result = await db.collection('users').insertOne(newUser);
        
        // Use upsert for wallet - if wallet exists, it won't be modified, if not, it will be created
        await db.collection('wallet').updateOne(
          { userId: result.insertedId },
          { $setOnInsert: { balance: 0 } },
          { upsert: true }
        );
      
        done(null, newUser); // Pass the new user to Passport
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.gid); // Store the user's Google ID in the session
});

// Deserialize user
passport.deserializeUser(async (gid, done) => {
  const db = await mongo();
  const user = await db.collection('users').findOne({ gid: gid });
  done(null, user); // Retrieve the user from the database using the Google ID
});
module.exports = passport;