import { Hono } from 'hono';
import { creatorController } from '../../controllers/creatorController.js';
import { validateRequired, validateWalletAddress } from '../../middleware/validation.js';

const creatorRoutes = new Hono();

/**
 * @swagger
 * /creators:
 *   get:
 *     summary: List all creators
 *     description: Retrieve a paginated list of all registered creators
 *     tags: [Creators]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: starting_after
 *         schema:
 *           type: string
 *         description: Cursor for pagination
 *     responses:
 *       200:
 *         description: List of creators
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ListResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Creator'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
creatorRoutes.get('/', creatorController.getAllCreators);

/**
 * @swagger
 * /creators/register:
 *   post:
 *     summary: Register as a creator
 *     description: Register the authenticated user as a creator with profile information
 *     tags: [Creators]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: Creator display name
 *                 example: "Alice Cooper"
 *               bio:
 *                 type: string
 *                 description: Creator biography
 *                 example: "Digital artist and NFT creator"
 *               socialLinks:
 *                 type: object
 *                 description: Social media links
 *                 example:
 *                   twitter: "https://twitter.com/alicecooper"
 *                   instagram: "https://instagram.com/alicecooper"
 *     responses:
 *       200:
 *         description: Creator registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creator'
 *       400:
 *         description: Creator already registered or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
creatorRoutes.post('/register', 
  validateRequired(['displayName']), 
  creatorController.registerCreator
);

/**
 * @swagger
 * /creators/{address}:
 *   get:
 *     summary: Get creator profile
 *     description: Retrieve a creator's public profile information
 *     tags: [Creators]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *         example: "0x742d35Cc6435C426FD4a4b5421e0B65dC55bd0E7"
 *     responses:
 *       200:
 *         description: Creator profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creator'
 *       400:
 *         description: Invalid wallet address format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Creator not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
creatorRoutes.get('/:address', 
  validateWalletAddress('address'), 
  creatorController.getCreator
);

/**
 * @swagger
 * /creators/profile:
 *   put:
 *     summary: Update creator profile
 *     description: Update the authenticated creator's profile information
 *     tags: [Creators]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: Creator display name
 *                 example: "Alice Cooper"
 *               bio:
 *                 type: string
 *                 description: Creator biography
 *                 example: "Digital artist and NFT creator"
 *               socialLinks:
 *                 type: object
 *                 description: Social media links
 *                 example:
 *                   twitter: "https://twitter.com/alicecooper"
 *                   instagram: "https://instagram.com/alicecooper"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creator'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Creator not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
creatorRoutes.put('/profile', creatorController.updateProfile);

export { creatorRoutes };