import { Hono } from 'hono';
import { productController } from '../../controllers/productController.js';
import { validateRequired, validateWalletAddress, validateTypes } from '../../middleware/validation.js';
import { createRateLimit } from '../../middleware/rateLimit.js';

const productRoutes = new Hono();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new digital product for the authenticated creator
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - name
 *               - priceUsdc
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Unique numeric product identifier
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "Exclusive Digital Art NFT"
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "A unique digital artwork with exclusive creator access"
 *               priceUsdc:
 *                 type: string
 *                 description: Price in USDC (as string for precision)
 *                 example: "10.50"
 *               ipfsContentHash:
 *                 type: string
 *                 description: IPFS hash for digital content
 *                 example: "QmX7Z8K9L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5"
 *               metadata:
 *                 type: object
 *                 description: Additional product metadata
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Product already exists or validation error
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
productRoutes.post('/', 
  createRateLimit,
  validateRequired(['productId', 'name', 'priceUsdc']),
  validateTypes({
    productId: 'integer',
    name: 'string',
    priceUsdc: 'string',
    description: 'string'
  }),
  productController.createProduct
);

/**
 * @swagger
 * /products/my:
 *   get:
 *     summary: Get my products
 *     description: Retrieve all products created by the authenticated user
 *     tags: [Products]
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
 *         description: List of creator's products
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
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productRoutes.get('/my', productController.getMyProducts);

/**
 * @swagger
 * /products/creator/{address}:
 *   get:
 *     summary: Get creator's products
 *     description: Retrieve all products created by a specific creator
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Creator's Ethereum wallet address
 *         example: "0x742d35Cc6435C426FD4a4b5421e0B65dC55bd0E7"
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
 *         description: List of creator's products
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
 *                         $ref: '#/components/schemas/Product'
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
 */
productRoutes.get('/creator/:address', 
  validateWalletAddress('address'), 
  productController.getCreatorProducts
);

/**
 * @swagger
 * /products/{productId}/status:
 *   put:
 *     summary: Update product status
 *     description: Activate or deactivate a product for sale
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Whether product should be active for sale
 *                 example: true
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "prod_123"
 *                 object:
 *                   type: string
 *                   example: "product"
 *                 productId:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Exclusive Digital Art NFT"
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 updated:
 *                   type: integer
 *                   example: 1720003600
 *       400:
 *         description: Validation error
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
 *         description: Product not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productRoutes.put('/:productId/status', 
  validateRequired(['isActive']), 
  productController.updateProductStatus
);

export { productRoutes };