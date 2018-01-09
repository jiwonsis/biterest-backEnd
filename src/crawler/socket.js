const WebSocket = require('ws');

module.exports = (() => {
    let _client = null;
    let _messageHandler = (message) => { console.warn('messageHandler not defined'); };
    let _refreshHandler = () => { console.warn('refreshHandler not defined'); };

    const handlers = {
        open: () => {
            console.log('connected to server');
            // subscribe to ticker
            _client.send(`{"command": "subscribe", "channel": "1002"}`);
        },
        message: (message) => {
            _messageHandler(message);
        }
    };

    const reconnect = () => {
        console.log('reconnecting...');
        setTimeout(connect, 100);
    };

    const connect = () => {
        _client = new WebSocket('wss://api2.poloniex.com');
        _client.on('open', handlers.open);
        _client.on('message', handlers.message);
        _client.on('close', reconnect);
    };

    return {
        set handleMessage(messageHandler) {
            _messageHandler = messageHandler;
        },
        set handleRefrash(refreshHandler) {
            _refreshHandler = refreshHandler;
        },
        connect,
        get getClient() {
            return _client;
        }
    };
})();