import { Hono } from 'hono';
import { authController } from '../../controllers/authController.js';
import { authRateLimit } from '../../middleware/rateLimit.js';
import { authenticateToken } from '../../middleware/auth.js';

const authRoutes = new Hono();

/**
 * @swagger
 * /auth/nonce:
 *   get:
 *     summary: Get authentication nonce
 *     description: Generate a random nonce for SIWE (Sign-In with Ethereum) authentication
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 object:
 *                   type: string
 *                   example: "nonce"
 *                 nonce:
 *                   type: string
 *                   example: "abc123def456"
 *                 created:
 *                   type: integer
 *                   example: 1720000000
 */
authRoutes.get('/nonce', authController.getNonce);
authRoutes.get('/siwe-template', authController.getSiweTemplate);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate with SIWE
 *     description: Sign in using Ethereum wallet with SIWE message and signature
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - signature
 *             properties:
 *               message:
 *                 type: string
 *                 description: SIWE message string
 *               signature:
 *                 type: string
 *                 description: Wallet signature of the message
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 object:
 *                   type: string
 *                   example: "authentication"
 *                 id:
 *                   type: string
 *                   example: "auth_1720000000"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 address:
 *                   type: string
 *                   example: "0x742d35cc6435c426fd4a4b5421e0b65dc55bd0e7"
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 created:
 *                   type: integer
 *                   example: 1720000000
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.post('/login', authRateLimit, authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate user session and clear authentication token
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 object:
 *                   type: string
 *                   example: "authentication"
 *                 id:
 *                   type: string
 *                   example: "logout_1720000000"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *                 created:
 *                   type: integer
 *                   example: 1720000000
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.post('/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify authentication status
 *     description: Check if the provided JWT token is valid and return user info
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 object:
 *                   type: string
 *                   example: "authentication_status"
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *                 address:
 *                   type: string
 *                   example: "0x742d35cc6435c426fd4a4b5421e0b65dc55bd0e7"
 *                 chainId:
 *                   type: integer
 *                   example: 1
 *                 created:
 *                   type: integer
 *                   example: 1720000000
 *       401:
 *         description: Access token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRoutes.get('/verify', authenticateToken, authController.verifyAuth);

export { authRoutes };