// utils/tokenUtils.js
// JWT token generation and management

const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtRefreshSecret, jwtAccessExpire, jwtRefreshExpire } = require('../config/env');
const { prisma } = require('../config/database');

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    jwtAccessSecret,
    { expiresIn: jwtAccessExpire }
  );
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    jwtRefreshSecret,
    { expiresIn: jwtRefreshExpire }
  );
};

/**
 * Generate both access and refresh tokens
 */
const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtRefreshSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Store refresh token in database
 */
const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

/**
 * Remove refresh token from database (logout)
 */
const removeRefreshToken = async (token) => {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

/**
 * Remove all refresh tokens for a user (logout from all devices)
 */
const removeAllRefreshTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Check if refresh token exists and is valid
 */
const isRefreshTokenValid = async (token) => {
  const refreshToken = await prisma.refreshToken.findFirst({
    where: {
      token,
      expiresAt: { gte: new Date() }, // Not expired
    },
  });

  return !!refreshToken;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyRefreshToken,
  storeRefreshToken,
  removeRefreshToken,
  removeAllRefreshTokens,
  isRefreshTokenValid,
};
