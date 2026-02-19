const mongo = require("../../mongodb/mongo");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const loadlogin = (req, res) => {
  try {
    res.render("user/login", { error: "" });
  } catch (error) {
    console.error("Error in loadlogin:", error);
    res.status(500).send("Internal Server Error");
  }
};

const register = async (req, res) => {
  try {
    const db = await mongo();

    const user = await db
      .collection("users")
      .find({ email: req.body.email })
      .toArray();

    if (!user[0]) {
      const data = {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        otp: generateOTP(),
        otpCreatedAt: Date.now(),
        list: true,
      };

      console.log(data.otp);

      req.session.data = data;
      res.redirect("otp");
    } else {
      res.render("user/login", { error: "user already exist" });
    }
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).send("Internal Server Error");
  }
};

const loadotp = (req, res) => {
  try {
    sendotp(req.session.data.otp, req.session.data.email);
    res.render("user/otp", { error: "" });
  } catch (error) {
    console.error("Error in loadotp:", error);
    res.status(500).send("Internal Server Error");
  }
};

const otpverify = async (req, res) => {
  try {
    const otparr = Object.values(req.body);
    let otp = "";
    for (const i of otparr) {
      otp += i;
    }

    const data = req.session.data;
    const currentTime = Date.now();
    const otpExpiryTime = data.otpCreatedAt + 30000;
    if (currentTime > otpExpiryTime) {
      res.render("user/otp", { error: "expired" });
      return;
    }
    if (data.otp === otp) {
      delete data.otp;

      if (req.session.forgot) {
        req.session.authtochangepassword = true;
        res.render("user/passwordreset");
      } else {
        const db = await mongo();
        data.createdAt = new Date().toDateString();

        await db.collection("users").insertOne(data).then((result) => {
          db.collection("wallet").insertOne({
            userId: result.insertedId,
            balance: 0,
          });
          req.session.uid = result.insertedId;
          req.session.save();
        });

        req.session.user = true;
        res.redirect("/user");
      }
    } else {
      res.render("user/otp", { error: "wrong otp" });
    }
  } catch (error) {
    console.error("Error in otpverify:", error);
    res.status(500).send("Internal Server Error");
  }
};

const reotp = (req, res) => {
  try {
    const otp = generateOTP();
    console.log(otp);
    req.session.data.otp = otp;
    req.session.data.otpCreatedAt = Date.now();
    sendotp(otp, req.session.data.email);
    res.send(JSON.stringify({ changed: true }));
  } catch (error) {
    console.error("Error in reotp:", error);
    res.status(500).send("Internal Server Error");
  }
};

const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    const db = await mongo();
    const users = await db.collection("users").find({ email }).toArray();

    const match = await bcrypt.compare(password, users[0]?.password || "");
    if (users[0]?.email === email && match) {
      req.session.data = { email };
      req.session.uid = users[0]._id;
      req.session.user = true;
      res.redirect("/user");
    } else {
      res.render("user/login", { error: "wrong credentials" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).send("Internal Server Error");
  }
};

const googleauth = (req, res) => {
  try {
    passport.authenticate("google", { scope: ["profile", "email"] });
  } catch (error) {
    console.error("Error in googleauth:", error);
    res.status(500).send("Internal Server Error");
  }
};

const forgot = async (req, res) => {
  const { email } = req.params;
  const db = await mongo();
  if (!(await db.collection("users").findOne({ email }))) {
    return res.render("user/login", { error: "email doesnt exist" });
  }
  req.session.data = { otp: generateOTP(), otpCreatedAt: new Date() };

  sendotp(req.session.data.otp, email);
  req.session.data.otpCreatedAt = Date.now();
  req.session.forgot = true;
  req.session.data.email = email;
  console.log(req.session.data.otp);
  res.render("user/otp", { error: "" });
};

const resetpassword = async (req, res) => {
  try {
    if (req.session.authtochangepassword) {
      const hashedpass = await bcrypt.hash(req.body.password, 10);
      const db = await mongo();

      await db
        .collection("users")
        .updateOne(
          { email: req.session.data.email },
          { $set: { password: hashedpass } }
        );
      res.redirect("/user/login");
    } else {
      res.redirect("/user/login");
    }
  } catch (er) {
    console.log(er);
  }
};

const changepassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = await mongo();
  const data = await db
    .collection("users")
    .findOne({ _id: new ObjectId(req.session.uid) });

  const ismatch = await bcrypt.compare(currentPassword, data.password);

  if (ismatch) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.session.uid) },
        { $set: { password: hashed } }
      );
    res.json({ status: "success" });
  } else {
    res.json({ message: "current password is wrong" });
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/user/login");
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).send("Internal Server Error");
  }
};

function generateOTP(length = 6) {
  return crypto
    .randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0");
}

async function sendotp(otp, email) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    const mail = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Your OTP Code",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f7fc;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 30px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 {
                color: #4CAF50;
                font-size: 24px;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #4CAF50;
                text-align: center;
                margin-top: 20px;
              }
              .message {
                font-size: 16px;
                text-align: center;
                margin-top: 10px;
                color: #555;
              }
              .footer {
                font-size: 14px;
                text-align: center;
                margin-top: 30px;
                color: #777;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fff;
                background-color: #4CAF50;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Our Service!</h1>
              </div>
              <div class="message">
                <p>Your OTP verification code is:</p>
                <div class="otp-code">${otp}</div>
              </div>
              <div class="footer">
                <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    const info = await transporter.sendMail(mail);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

module.exports = {
  loadlogin,
  register,
  loadotp,
  otpverify,
  reotp,
  login,
  googleauth,
  forgot,
  resetpassword,
  changepassword,
  logout,
};

