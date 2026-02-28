import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

interface ChatAuthor {
  address: string
  displayName: string
  avatar?: string
  isCreator: boolean
}

interface ChatMessage {
  id: string
  content: string
  author: ChatAuthor
  timestamp: number
  type: string
}

interface IncomingMessage {
  content: string
  authorAddress: string
  authorName?: string
  authorAvatar?: string
  isCreator?: boolean
  type?: string
}

const clients = new Set<WebSocket>()
const chatHistory: ChatMessage[] = []

function broadcast(data: unknown): void {
  const message = JSON.stringify(data)

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message)
      } catch (error) {
        console.error('Error sending message to client:', error)
        clients.delete(client)
      }
    } else {
      clients.delete(client)
    }
  })
}

export const initChatServer = (port = 8080) => {
  const server = createServer()
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    console.log('Client connected to chat')
    clients.add(ws)

    if (chatHistory.length > 0) {
      ws.send(JSON.stringify({
        type: 'history',
        messages: chatHistory.slice(-50)
      }))
    }

    broadcast({
      type: 'user_count',
      count: clients.size
    })

    ws.on('message', (data) => {
      try {
        const message: IncomingMessage = JSON.parse(data.toString())

        if (!message.content || !message.authorAddress) {
          return
        }

        const chatMessage: ChatMessage = {
          id: Date.now().toString(),
          content: message.content,
          author: {
            address: message.authorAddress,
            displayName: message.authorName || `${message.authorAddress.slice(0, 6)}...${message.authorAddress.slice(-4)}`,
            avatar: message.authorAvatar,
            isCreator: message.isCreator || false
          },
          timestamp: Date.now(),
          type: message.type || 'message'
        }

        chatHistory.push(chatMessage)
        if (chatHistory.length > 100) {
          chatHistory.shift()
        }

        broadcast({
          type: 'new_message',
          message: chatMessage
        })
      } catch (error) {
        console.error('Error processing chat message:', error)
      }
    })

    ws.on('close', () => {
      console.log('Client disconnected from chat')
      clients.delete(ws)

      broadcast({
        type: 'user_count',
        count: clients.size
      })
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      clients.delete(ws)
    })
  })

  server.listen(port, () => {
    console.log(`Chat WebSocket server running on port ${port}`)
  })

  return { server, wss, broadcast }
}
