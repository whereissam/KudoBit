import { Hono } from 'hono';
import { eventIndexer } from '../../event-indexer.js';

const indexerRoutes = new Hono();

/**
 * @swagger
 * /indexer/status:
 *   get:
 *     summary: Get event indexer status
 *     description: Get current status and statistics of the blockchain event indexer
 *     tags: [System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Indexer status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isRunning:
 *                       type: boolean
 *                       example: true
 *                     currentBlock:
 *                       type: integer
 *                       example: 18932500
 *                     lastProcessedBlock:
 *                       type: integer
 *                       example: 18932450
 *                     blocksBehind:
 *                       type: integer
 *                       example: 50
 *                     creatorStoreAddress:
 *                       type: string
 *                       example: "0x203B1f821F726d596b57C1399906EF338b98b9FF"
 *                     loyaltyTokenAddress:
 *                       type: string
 *                       example: "0x89de622217c01f4c97453a35CaFfF1E7b7D6f8FC"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
indexerRoutes.get('/status', async (c) => {
  try {
    const status = await eventIndexer.getIndexingStatus();
    return c.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Indexer status error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export { indexerRoutes };