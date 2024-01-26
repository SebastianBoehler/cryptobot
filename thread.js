const {
    workerData,
    parentPort
} = require('worker_threads')
const CoinbasePro = require('coinbase-pro');
var publicClient = new CoinbasePro.PublicClient();
const fs = require('fs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const zip = require('express-zip');
var cookieParser = require('cookie-parser');
const fileUtils = require('./fileUtils');
//const { testRule } = require('./ruleTester')
//const trade_accounts = require('./index').APIs['trade_accounts'];
var {
    generateIndicators
} = require('./indicators');

var allProducts;

(async () => {
    allProducts = await new Promise((resolve, reject) => {
        publicClient.getProducts((err, response, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
    if (workerData['action'] === 'database') {
        databaseGen()
        parentPort.postMessage('started with generating history database')
    } else if (workerData['action'] === 'server') {
        startServer()
    } else if (workerData['action'] === 'indicators') {
        //TODO
    } else if (workerData['action'] === 'all Trends') {
        parentPort.postMessage('started with generating all Trends')
        IndicatorGen()
    } else if (workerData['action'] === 'testRule') {
        await main()
    }
})()

async function productTicker(currency) {
    return new Promise((resolve, reject) => {
        publicClient.getProductTicker(currency, (err, response, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

async function databaseGen() {

    for (var a in allProducts) {
        const id = allProducts[a]['id']
        if ((id.includes('USD') && !id.includes('USDC')) || id.includes('GBP')) continue
        parentPort.postMessage(id)

        if (!fs.existsSync(`./data/history/${id}_history.json`)) {
            //create file if not existing
            fs.writeFile(`./data/history/${id}_history.json`, JSON.stringify([], null, 3), "utf8", async function (err) {
                if (err) {
                    console.log(err)
                    //continue
                }
            })
            await sleep(500)
        }


        var history = await fileUtils.loadFile(`./data/history/${id}_history.json`).catch(e => {console.log(e)})
        if (!history) continue
        //console.log('history', history)

        const product = await productTicker(id)
            .catch(e => {
                console.log(e)
                return undefined
            })

        const DayStats = await publicClient.getProduct24HrStats(id)
            .catch(e => {
                console.log(e)
                return undefined
            })

        if (!product || !DayStats) {
            console.log('no data')
            continue
        }

        editDatabase()

        async function editDatabase() {
            //console.log(id)
            const now = new Date()
            var ago = new Date()
            //ago.setMinutes(ago.getMinutes() - 15)
            ago.setSeconds(ago.getSeconds() - 60)

            var expiration = new Date()
            expiration.setHours(expiration.getHours() - 336) //14 Tage

            for (var a in history) {
                if (history[a]['time'] < expiration.getTime()) {
                    history.splice(a, 1)
                }
            }

            var object = {
                //profit: obj['profit'],
                volume: Number(product['volume']),
                time: now.getTime(),
                price: Number(product['price']),
                high: Number(DayStats['high']),
                low: Number(DayStats['low']),
            }

            if (history.length === 0) {
                history.push(object)
            } else if (history[history.length - 1]['time'] < ago.getTime()) {
                history.push(object)
            }

            //console.log(Array.isArray(history), history.length, history)
            if (Array.isArray(history)) {
                await save(history)
                    .catch(async e => {
                        console.log('failed saving data for', id)
                        console.log(e)
                    })
               // console.log('after save')
            }
        }
        await sleep(1500)

        async function save(data) {
            //fileUtils.pushData(id, data)
            await fs.promises.writeFile(`./data/history/${id}_history.json`, JSON.stringify(data), 'utf-8')
            //console.log('exported')
        }
    }
    databaseGen()
}

async function IndicatorGen() {
    var trends = {}
    const granularities = [1, 5, 15, 25]
    for (var a in allProducts) {
        const id = allProducts[a]['id']
        if (fs.existsSync(`./data/history/${id}_history.json`)) {
            var history = await fileUtils.loadFile(`./data/history/${id}_history.json`)
            if (history.length > 500) {
                trends[id] = {}
                trends[id]['volatility'] = Number((history[history.length - 1]['high'] / history[history.length - 1]['low'] - 1) * 100).toFixed(2) + ' %'

                for (var b in granularities) {
                    const granularity = granularities[b]
                    var result = await generateIndicators('SMA', granularity, history.map(item => Number(item['price'])))
                    if (result) trends[id][b] = {
                        trend: result['trend'],
                        difference: result['difference'] || undefined
                    }
                }

                var timestamp = new Date()
                timestamp.setMinutes(timestamp.getMinutes() - 60)
                var timestamp2 = new Date()
                timestamp2.setMinutes(timestamp2.getMinutes() - 180)
                var timestamp3 = new Date()
                timestamp3.setMinutes(timestamp3.getMinutes() - 15)
                var timestamp4 = new Date()
                timestamp4.setDate(timestamp4.getDate() - 1)
                var timestamp5 = new Date()
                timestamp5.setDate(timestamp5.getDate() - 5)
                for (var c in history) {
                    const max = Math.max(...history.slice(c, history.length).map(item => Number(item['price'])))
                    const min = Math.min(...history.slice(c, history.length).map(item => Number(item['price'])))
                    const volatility = Number((max / min - 1) * 100).toFixed(2)
                    if (history[c]['time'] > timestamp.getTime()) {
                        if (!trends[id]['1h_volatility']) trends[id]['1h_volatility'] = volatility + ' %'
                    }
                    if (history[c]['time'] > timestamp2.getTime()) {
                        if (!trends[id]['3h_volatility']) trends[id]['3h_volatility'] = volatility + ' %'
                    }
                    if (history[c]['time'] > timestamp3.getTime()) {
                        if (!trends[id]['15m_volatility']) trends[id]['15m_volatility'] = volatility + ' %'
                    }
                    if (history[c]['time'] > timestamp4.getTime()) {
                        if (!trends[id]['1d_volatility']) trends[id]['1d_volatility'] = volatility + ' %'
                    }
                    if (history[c]['time'] > timestamp5.getTime()) {
                        if (!trends[id]['5d_volatility']) trends[id]['5d_volatility'] = volatility + ' %'
                    }
                    //if (trends[id]['1h_volatility'] && trends[id]['3h_volatility'] && trends[id]['15m_volatility']) break
                }
            }
            //history = fileUtils.requireUncached(`./data/history/${id}_history.json`)
        } else {
            //console.log('file not found!', id)
        }
    }

    fs.writeFile(`./data/indicators/allTrends.json`, JSON.stringify(trends, null, 3), "utf8", async function (err) {})
    await sleep(25000)
    IndicatorGen()
}

async function startServer() {
    const {
        forecast
    } = require('./forecast');
    const app = express();
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(express.static(__dirname + '/site'));
    app.use(cookieParser())

    app.post('/sms', async (req, res) => {
        var obj = require('./data.json')
        const twiml = new MessagingResponse();

        var message = req.body['Body'] + ''
        message = message.toUpperCase()

        res.writeHead(200, {
            'Content-Type': 'text/xml'
        });
        res.end(twiml.toString());
    });

    app.get('/', function (req, res) {
        //console.log(req.url, req.originalUrl)
        if (req.query['demo']) {
            res.sendFile(__dirname + '/site/home.html')
            return
        }
        const cookie = req.cookies
        const values = parseInt(req.query['values']) || parseInt(cookie['btvv']) || 750
        var granularity = parseInt(req.query['granularity']) || parseInt(cookie['btgv']) || 1
        const portfolio = req.query['portfolio'] || cookie['btpv'] || undefined
        res.cookie('btgv', granularity, {
            maxAge: 900000,
            httpOnly: false
        })
        res.cookie('btpv', portfolio, {
            maxAge: 900000,
            httpOnly: false
        })
        res.cookie('btvv', values, {
            maxAge: 900000,
            httpOnly: false
        })
        //console.log(values, granularity, portfolio, `/?portfolio=${portfolio}&values=500&granularity=${granularity}`)
        if (!req.query['values']) {
            if (portfolio) res.redirect(`/?portfolio=${portfolio}&values=${values}&granularity=${granularity}`)
            //else if (req.query['pair']) res.redirect(`/?pair=${req.query['pair']}&values=500&granularity=${granularity}`)
            else res.send('invalid url parameters!')
        } else {
            res.sendFile(__dirname + '/site/home.html')
        }
    })

    app.get('/analytics', function (req, res) {
        const cookie = req.cookies
        const portfolio = req.query['portfolio'] || cookie['btpv']
        if (!portfolio && !req.query['id']) res.redirect(`/analytics?portfolio=${portfolio}`)
        else res.sendFile(__dirname + '/site/analytics.html');
    })

    app.get('/history', async function (req, res) {
        var portfolio = req.query['portfolio'] || undefined
        var pair = req.query['pair'] || undefined
        if (portfolio && portfolio !== 'undefined') {
            portfolio = await fileUtils.loadFile(`./data/${portfolio}_data.json`)
            var history = await fileUtils.loadData(portfolio['tradingPair'], req.query['platform'].toUpperCase())
            //console.log(history)
            var length = history.length - 1 - Number(req.query['v'])
            if (Number(req.query['v']) > history.length) length = 0
            res.send(history.slice(length, history.length - 1))
        } else if (pair) {
            var history = await fileUtils.loadData(pair, req.query['platform'].toUpperCase())
            var length = history.length - 1 - Number(req.query['v'])
            if (Number(req.query['v']) > history.length) length = 0
            //console.log('history length', history.slice(length, history.length - 1).length)
            res.send(history.slice(length, history.length - 1).map(item => {
                return {
                    time: item['time'],
                    price: item['price']
                }
            }))
        }
    })

    app.get('/data.json', function (req, res) {
        const portfolio = req.query['portfolio']
        const demo = req.query['demo'] === '1' || false
        if (!demo) res.sendFile(__dirname + `/data/${portfolio}_data.json`);
        else res.sendFile(__dirname + `/data/tests/${req.query['pair']}_test.json`);
        //res.download(__dirname + '/data.json')
    })

    app.get('/products', function (req, res) {
        res.send(allProducts);
        //res.download(__dirname + '/data.json')
    })

    app.get('/download', function (req, res) {
        //res.sendFile(__dirname + '/data.json');
        //res.download(__dirname + '/data.json')
        //res.download(__dirname + '/history.json')
        //res.download(__dirname + '/backup.json')
        res.send('outdated')
    })

    app.get('/indicators', async function (req, res) {
        var portfolio = req.query['portfolio']
        const values = Number(req.query['values']) || 500
        const granularity = Number(req.query['granularity'])
        const platform = req.query['platform'] || 'coinbase'
        if (req.query['pair']) {
            pair = req.query['pair']
            history = await fileUtils.loadData(pair, platform.toUpperCase())

            var array = history.map(item => {
                return {
                    price: Number(item['price']),
                    timestamp: item['time']
                }
            })

            var dataset = []

            console.log('granularity', granularity, req.query)
            console.log(history.length)

            const factor = Number(req.query['factor'])
            var result = await generateIndicators(req.query['indicator'], granularity, array, true, {
                'eight': 8 * factor,
                'thirteen': 13 * factor,
                'twentyone': 21 * factor,
                'fiftyfive': 55 * factor
            });

            console.log(result['MACD'].length)
            console.log(result['array'].length)


            res.send(result['array'].slice(result['array'].length - Number(req.query['values']), result['array'].length))
            return
        }

        portfolio = await fileUtils.loadFile(`./data/${portfolio}_data.json`)
        var pair = portfolio['tradingPair']
        const indicator = portfolio['indicator']
        var history = await fileUtils.loadData(pair, platform.toUpperCase())

        //console.log(pair, indicator)

        if (!granularity) {
            res.send('granularity missing')
            return
        }

        //console.log('values', values, req.query['values'])

        //if (granularity === 1) history = history.slice(history.length / 2, history.length)

        var array = history.map(item => {
            return {
                price: Number(item['price']),
                timestamp: item['time']
            }
        })

        if (portfolio) {
            var dataset = []

            //console.log('granularity', granularity)
            var startRange = array.length - (values * granularity) - 500

            if (startRange < 500) startRange = 500
            //console.log(startRange, array.length)

            for (var a = startRange; a < array.length; a++) {
                const factor = 1
                var result = await generateIndicators(indicator, granularity, array.map(item => item['price']).slice(0, a), {
                    'eight': 8 * factor,
                    'thirteen': 13 * factor,
                    'twentyone': 21 * factor,
                    'fiftyfive': 55 * factor
                });
                //var result = await generateIndicators(indicator, granularity, array.map(item => item['price']).slice(0, a))
                result['timestamp'] = array[a]['timestamp']
                //console.log(result)
                dataset.push(result)
            }

            var length = dataset.length - (values + 1)
            //console.log('length before math')
            if (values > dataset.length) length = 0

            //console.log('send values', dataset.slice(length, dataset.length - 1).length)

            res.send(dataset.slice(length, dataset.length - 1))
        }
    })

    app.get('/allTrends', function (req, res) {
        res.sendFile(__dirname + `/data/indicators/allTrends.json`);
        //res.download(__dirname + '/data.json')
    })

    app.get('/products', async function (req, res) {
        const platform = req.query['platform'] || 'coinbase'
        if (platform === 'coinbase') res.send(allProducts);
        else {
            data = await fetch('https://api.binance.com/api/v3/ticker/price')
                .then(async resp => {
                    const data = await resp.json()
                    return data.map(item => {
                        item['id'] = item['symbol']
                        return item
                    })
                })
                .catch(e => {
                    console.log(e)
                })
            res.send(data)
        }
        //res.download(__dirname + '/data.json')
    })

    app.get('/maxmin', async function (req, res) {
        var data = await fileUtils.loadData(req.query['pair'], req.query['platform'].toUpperCase())
        data= data.map(item => Number(item['price']))
        res.send({
            max: Math.max(...data),
            min: Math.min(...data),
            difference: Math.max(...data) / Math.min(...data)
        })
    })

    app.get('/allProfits', async function (req, res) {
        const allProfits = await fileUtils.loadFile('./data/tests/allProfits.json')
        var array = []
        for (var a in allProfits) {
            //for each currency
            //const max = Math.max.apply(Math, allProfits[a].map(function(item) { return Number(parseFloat(item['generalProfit'])); }))
            for (var c in allProfits[a]) {
                if (allProfits[a][c]['profit'] <= 0) continue
                array.push({
                    data: allProfits[a][c],
                    pair: a,
                    indicator: c,
                    url: `http://localhost:1337/analytics?demo=1&id=${a}&indicator=${c.split(' ')[1]}&rule=${c.split(' ')[0]}&factor=${allProfits[a][c]['factor']}&platform=${allProfits[a][c]['platform']}`
                    //max: max
                })
            }
        }
        array.sort(function (a, b) {
            return parseFloat(b['data']['profit']) - parseFloat(a['data']['profit']);
        })
        res.send(array)
        //res.download(__dirname + '/data.json')
    })

    app.get('/forecast', async function (req, res) {
        const id = req.query['id']
        res.sendFile(__dirname + `/data/predictions/${id}_prediction.json`)
    })

    app.get('*', function (req, res) {
        res.redirect('/')
        //res.download(__dirname + '/data.json')
    })

    http.createServer(app).listen(1337, () => {
        parentPort.postMessage('Express server listening on port 1337');
    });
}