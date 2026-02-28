#!/usr/bin/env bun
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'kudobit-hackathon-secret-key';

const payload = {
  address: '0x1234567890123456789012345678901234567890',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
};

const token = jwt.sign(payload, JWT_SECRET);
console.log('🎫 Test JWT Token for Swagger UI:');
console.log(token);
console.log('\n📋 Steps:');
console.log('1. Copy the token above');
console.log('2. In Swagger UI, click the 🔒 "Authorize" button');
console.log('3. Enter: Bearer ' + token);
console.log('4. Now you can test protected endpoints!');