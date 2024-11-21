// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
import serverless from "serverless-http";

const app = express();
app.use(cors({
  origin: 'https://dar-time-trials-dragrace.vercel.app', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Registration Schema
const registrationSchema = new mongoose.Schema({
  firstName: String,
  surname: String,
  racingTeamName: String,
  dateOfBirth: String,
  nationality: String,
  idNumber: String,
  address: String,
  mobile: String,
  email: String,
  drivingLicense: String,
  dlExpiryDate: String,
  carMake: String,
  carModel: String,
  manufactureYear: String,
  registrationNo: String,
  engineCC: String,
  estimatedHP: String,
  color: String,
  brakingSystem: String,
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

const Registration = mongoose.model('Registration', registrationSchema);

// Email configuration
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.ADMIN_EMAIL,
      subject: 'New DAR Time Trials Registration',
      html: `
        <h2>New Registration Details</h2>
        <p><strong>Name:</strong> ${req.body.firstName} ${req.body.surname}</p>
        <p><strong>Team:</strong> ${req.body.racingTeamName}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Car:</strong> ${req.body.carMake} ${req.body.carModel}</p>
        <p><strong>Registration No:</strong> ${req.body.registrationNo}</p>
      `
    };

   
transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
        console.error('Error occurred:', err.message);
    } else {
        console.log('Email sent:', info.response);
    }
});

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing registration' });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ registrationDate: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});
export const handler = serverless(app);
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
   console.log(`Server running on port ${PORT}`);
});