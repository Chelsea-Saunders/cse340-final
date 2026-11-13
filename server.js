
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.log('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});