const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  university: user.university || '',
  address: user.address || '',
});

const registerUser = async (req, res) => {
  const { name, email, password, adminCode } = req.body || {};
  const fieldErrors = {};

  if (!name || !String(name).trim()) {
    fieldErrors.name = 'Full name is required.';
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    fieldErrors.email = 'Enter a valid university or personal email address.';
  }
  if (!password || String(password).length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({
      message: 'Please correct the highlighted registration fields.',
      fieldErrors,
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        message: 'An account with this email already exists.',
        fieldErrors: { email: 'An account with this email already exists.' },
      });
    }

    const allowAdminBootstrap =
      Boolean(process.env.ADMIN_BOOTSTRAP_CODE) &&
      adminCode === process.env.ADMIN_BOOTSTRAP_CODE;

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: allowAdminBootstrap ? 'educator' : 'student',
    });

    return res.status(201).json({
      ...serializeUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to complete registration.' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  const fieldErrors = {};

  if (!email || !String(email).trim()) {
    fieldErrors.email = 'Enter your email address.';
  }
  if (!password) {
    fieldErrors.password = 'Enter your password.';
  }
  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({
      message: 'Enter both email and password to sign in.',
      fieldErrors,
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (user && (await bcrypt.compare(String(password), user.password))) {
      return res.status(200).json({
        ...serializeUser(user),
        token: generateToken(user),
      });
    }
    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to complete sign-in.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json(serializeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load profile.' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, email, university, address } = req.body || {};
    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({
        message: 'Name cannot be empty.',
        fieldErrors: { name: 'Name cannot be empty.' },
      });
    }
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({
        message: 'Enter a valid email address.',
        fieldErrors: { email: 'Enter a valid email address.' },
      });
    }

    if (name !== undefined) user.name = String(name).trim();
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (university !== undefined) user.university = String(university).trim();
    if (address !== undefined) user.address = String(address).trim();

    const updatedUser = await user.save();
    return res.status(200).json({
      ...serializeUser(updatedUser),
      token: generateToken(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update profile.' });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
