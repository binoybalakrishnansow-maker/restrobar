// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
//import twilio from "twilio";

import twilio from "twilio";

// const TWILIO_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx";  // must start with AC
// const TWILIO_AUTH = "your_auth_token_here";
// const TWILIO_PHONE = "+1234567890"; // your Twilio phone number

// const client = twilio(TWILIO_SID, TWILIO_AUTH);

//const bodyParser = require("body-parser");
//const nodemailer = require("nodemailer");
//const twilio = require("twilio"); // if you want SMS OTP
//const cors = require("cors");

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


app.get('/api/data', async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool.request().query('SELECT * FROM dbo.Items');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send(err.message);
  }
});

app.post('/api/postdata', async (req, res) => {
  const { name, price, description } = req.body;

  try {
    const pool = await db.poolPromise;
    await pool.request()
      .input('name', db.sql.VarChar, name)
      .input('price', db.sql.Decimal(10, 2), price) 
      .input('description', db.sql.VarChar, description || null)
      .query(`
        INSERT INTO dbo.Items (Name, Price, Description)
        VALUES (@name, @price, @description)
      `);

    res.status(201).json({ message: 'Item added successfully' });
  } catch (err) {
    console.error('Error inserting item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await db.poolPromise;
    await pool.request()
      .input('ItemID', db.sql.Int, id)
      .query('DELETE FROM dbo.Items WHERE ItemID = @ItemID');

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/items/:id', async (req, res) => {
 const { id } = req.params;
  const { Name, Price, Description } = req.body;

  try {
    const pool = await db.poolPromise;
    await pool.request()
      .input('ItemID', db.sql.Int, id)
      .input('Name', db.sql.NVarChar, Name)
      .input('Price', db.sql.Decimal(10, 2), Price)
      .input('Description', db.sql.NVarChar, Description)
      .query(`
        UPDATE dbo.Items
        SET Name = @Name, Price = @Price, Description = @Description
        WHERE ItemID = @ItemID
      `);

    res.status(200).json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
  
});

app.post('/api/regpostdata', async (req, res) => {
  const { firstName, lastName, restaurantName, email, mobile, password } = req.body;

  try {
    const pool = await db.poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('firstName', db.sql.VarChar, firstName)
      .input('lastName', db.sql.VarChar, lastName)
      .input('restaurantName', db.sql.VarChar, restaurantName)
      .input('email', db.sql.VarChar, email)
      .input('mobile', db.sql.VarChar, mobile)
      .input('password', db.sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO dbo.[User] (FirstName, LastName, RestaurantName, EmailID, MobileNumber, Password, CreationDate)
        VALUES (@firstName, @lastName, @restaurantName, @email, @mobile, @password, GETDATE())
      `);

    res.status(201).json({ message: 'Restaurant registered successfully' });
  } catch (err) {
    console.error('Error registering restaurant:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

//LOGIN CODE

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
  
      const pool = await db.poolPromise;
      const result = await pool.request().input("email", db.sql.VarChar, email)
      .query(`
        SELECT UserID, EmailID, Password
        FROM dbo.[User] 
        WHERE EmailID = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.recordset[0];
    console.log("user found:", user);
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.Id, email: user.EmailID },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.Id, email: user.EmailID }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------- OTP Config ----------
const EMAIL_USER = process.env.EMAIL_USER;  // Gmail
const EMAIL_PASS = process.env.EMAIL_PASS;  // Gmail App Password
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const TWILIO_PHONE = process.env.TWILIO_PHONE; // e.g. +1415xxxxxxx (Twilio number)

const client = twilio(TWILIO_SID, TWILIO_AUTH);

// OTP storage (replace with Redis in prod)
let otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// Generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------- OTP APIs ----------
app.post('/api/requestotp', async (req, res) => {
  const { mobileOrEmail } = req.body;
  if (!mobileOrEmail) return res.status(400).json({ message: "Mobile or Email is required" });

  const otp = generateOtp();
  otpStore[mobileOrEmail] = otp;

  try {
    if (mobileOrEmail.includes("@")) {
      // Email case
      await transporter.sendMail({
        from: EMAIL_USER,
        to: mobileOrEmail,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}`,
      });
      return res.json({ message: "OTP sent via Email" });
    } else {
      // SMS case
      try {
        await client.messages.create({
          body: `Your OTP is ${otp}`,
          from: TWILIO_PHONE,
          to: mobileOrEmail.startsWith("+") ? mobileOrEmail : `+91${mobileOrEmail}`, // ensure E.164
        });
        return res.json({ message: "OTP sent via SMS" });
      } catch (smsError) {
        console.warn("SMS failed:", smsError.message);
        // fallback → send to admin email
        await transporter.sendMail({
          from: EMAIL_USER,
          to: EMAIL_USER,
          subject: `OTP for ${mobileOrEmail}`,
          text: `OTP for ${mobileOrEmail} is ${otp}`,
        });
        return res.json({ message: "SMS failed, OTP sent to admin email instead" });
      }
    }
  } catch (error) {
    console.error("OTP send error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { mobileOrEmail, otp } = req.body;
  if (!mobileOrEmail || !otp) return res.status(400).json({ message: "Mobile/Email and OTP required" });

  if (otpStore[mobileOrEmail] && otpStore[mobileOrEmail] === otp) {
    delete otpStore[mobileOrEmail];
    return res.json({ message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});