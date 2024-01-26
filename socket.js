const { ready } = require('@tensorflow/tfjs');
const express = require('express');
const app = express();
app.use(express.json());
const http = require('http');

const Binance = require('node-binance-api');
const binance = new Binance().options({});

const socket = require('http').createServer();

let chatHistory = []
let profits24h = []
let bestPerformingIndex 

let volumes

setInterval(getVolumes, 1000 * 60 * 5);

setInterval(() => {
    console.log(profits24h[0])
}, 1000 * 60 * 2);

async function getVolumes() {
    let raw = await binance.futuresDaily()
    let daily = JSON.parse(JSON.stringify(raw))
    let array = []
    console.log('get volumes')

    for (var g in daily) {
        let item = daily[g]
        array.push({
            symbol: item['symbol'] + 'PERP',
            change: parseFloat(item['priceChange']),
            volume: parseFloat(item['quoteVolume']), //USDT
            change_percentage: parseFloat(item['priceChangePercent'])
        })
        //console.log(array.length)
    }
    array.sort(function(a, b){return b['volume']-a['volume']})
    return array
}

const io = require('socket.io')(socket, {
    cors: {
        origin: '*'
    }
});

let connections = []

io.on('connection', (socket) => {
    console.log('a user connected', socket['id'])
    //socket.broadcast.to(socket['id']).emit('connected', chatHistory)
    socket.emit('connected', chatHistory)

    socket.on('setMachine', (data) => {
        //console.log('machine Id', data)
        let index = connections.findIndex(item => item['machine'] === data['machineID'])
        if (index < 0) connections.push({
            socket: socket['id'],
            machine: data['machineID'],
            type: 'machine'
        })
        else {
            connections[index]['machine'] = data['machineID']
            connections[index]['socket'] = socket['id']
        }
    });

    socket.on("disconnect", (data) => {
        console.log(socket['id'], ' disconnected...')
        let index = connections.findIndex(item => item['socket'] === socket['id'] || item['dashboard'] === socket['id'])
        let object = connections[index]
        if (!object) return
        let dashboardID = object['dashboard']
        let machine = object['machine']
        if (socket['id'] === object['socket']) {
            if (object['dashboard']) io.to(dashboardID).emit('machineData', {
                status: 'offline'
            })
            connections.splice(index, 1)
        }
        else if (socket['id'] === object['dashboard']) delete connections[index]['dashboard']
      });

    socket.on('message', (data) => {
        if (data['type'] === 'message') {
            chatHistory.push({
                author: data['author'],
                authorId: data['id'],
                message: data['message'],
                timestamp: new Date()
            })
            if (chatHistory.length > 45) chatHistory.shift()
            socket.emit('chatHistory', chatHistory)
        }
    });

    socket.on('roomSelect', (data) => {
        console.log(`${socket['id']} joined room ${data['room']}`)
        if (data['room']) socket.join(data['room'])
        //socket.join('test')
        socket.emit('rooms', {
            rooms: Array.from(socket.rooms),
            size: socket.rooms.size
        })
    });

    socket.on('getRooms', (data) => {
        console.log(`${socket['id']} requested rooms`)
        console.log(socket.rooms)
        socket.emit('rooms', {
            rooms: Array.from(socket.rooms),
            size: socket.rooms.size
        })
    });

    socket.on('leaveRoom', (data) => {
        console.log(`${socket['id']} leaves room ${data['room']}`)
        if (data['room']) socket.leave(data['room'])

        socket.emit('rooms', {
            rooms: Array.from(socket.rooms),
            size: socket.rooms.size
        })
    });

    socket.on('24h_profit', async (data) => {
        let ArrayIndex = profits24h.findIndex(item => item['symbol'] === data['symbol'] && item['index'] === data['index'])

        if (ArrayIndex === -1) {
            profits24h.push(data)
        } else {
            profits24h[ArrayIndex] = data
        }

        console.log('best ratio', (profits24h.sort(function(a, b){return b['ratio']-a['ratio']}))[0])

        profits24h.sort(function(a, b){return b['profit']-a['profit']})

        //console.log(JSON.stringify(profits24h[0]))

    });

    socket.on('executedOrder', async (data) => {
        console.log('executedOrder', data)
        let index = connections.findIndex(item => item['socket'] === socket['id'])
        if (index >= 0 && connections[index]['dashboard']) socket.emit('retrieveData', data)
    });

    socket.on('demoResults', async (data) => {
        data = JSON.parse(data)
        data.sort(function (a, b) {
            return b['filteredProfit'] - a['filteredProfit']
        })
        bestPerformingIndex = data[0]['indexNumber']
        console.log('best Index', bestPerformingIndex, data[0]['filteredProfit'])
    });

    socket.on('retrieveData', async (data) => {
        //socket.emit('machineData', data)
        //console.log('retrieve Data', data)
        let index = connections.findIndex(item => item['machine'] === data)
        console.log(connections, index)
        if (index < 0) {
            socket.emit('machineData', {
                status: 'offline'
            })
            return
        }
        let socketID = connections[index]['socket']
        //console.log('ask for data from', socketID)
        connections[index]['dashboard'] = socket['id']
        io.to(socketID).emit('retrieveData', data)
        //data = machineID
    });

    socket.on('savedSettings', async (data) => {
        let index = connections.findIndex(item => item['machine'] === data)
        if (index >= 0 && connections[index]['dashboard']) io.to(connections[index]['dashboard']).emit('savedSettings', data)
    })

    socket.on('setSettings', async (data) => {
        let index = connections.findIndex(item => item['machine'] === data['machine'])
        console.log('set settings index', index)
        if (index >= 0) {
            console.log('send to ', connections[index]['socket'])
            io.to(connections[index]['socket']).emit('setSettings', data)
        } else {
            //TODO return error
        }
    });

    socket.on('machineData', async (data) => {
        let index = connections.findIndex(item => item['machine'] === data['machine'])
        if (index >= 0 && connections[index]['dashboard']) {
            io.to(connections[index]['dashboard']).emit('machineData',data)
        } else socket.emit('machineData', {
            status: 'offline'
        })
    })
})

socket.listen(8080, async () => {
    console.log('socket listening on port 8080')
    volumes = await getVolumes()
    .catch(e => {
        console.log(e)
    })
})

app.use(express.static(__dirname + '/views'));

app.post('/action', async (req, res) => {
    //console.log(req.body)
    if (!volumes) {
        res.json({
            status: 'success'
        })
        return
    }
    let id = req.query['id']
    let mode = req.body['mode']
    let symbol = req.body['ticker']
    let details = req.body['details']
    let index = req.body['index']

    req.body['id'] = id

    //console.log('emitting to', symbol)
    let volumeIndex = volumes.findIndex(item => item['symbol'] === symbol)
    //console.log('VolumeIndex', volumeIndex, symbol)
    //if (volumeIndex <= 15) console.log(symbol, Math.abs(details[5]))

    req.body['volIndex'] = volumeIndex
    
    if (mode === 'live') io.to('live').emit('signal', req.body)
    else io.to('demo').emit('signal', req.body)

    io.to(symbol).to('all').emit('signal', req.body)

    //if (symbol.replace('PERP', '') === 'DOGEUSDT') console.log(req.body)

    if (index === bestPerformingIndex) {
        console.log('emit signal with index 50')
        req.body['index'] = 50
        req.body['mode'] = 'DEMO'
        io.to('demo').emit('signal', req.body)
    }

    if (profits24h.length >= 1 && profits24h[0]['index'] === index && profits24h[0]['symbol'] === symbol.replace('PERP', '') && profits24h[0]['profit'] >= 5 && profits24h[0]['ratio'] >= 0.6 && false) {
        console.log('emit signal with index 4')
        req.body['index'] = 4
        io.to('demo').emit('signal', req.body)
    }

    res.json({
        status: 'success'
    })
});

app.get('/dashboard', async (req, res) => {
    let machine = Buffer.from(req.query['machine'], 'base64').toString() 
    let code = Buffer.from(req.query['code'], 'base64').toString() //timetstamp
    res.sendFile(__dirname + '/views/index.html')
})

http.createServer(app).listen(80, () => {
    console.log('Express server listening on port 80')
});

