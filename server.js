const fs = require('fs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const zip = require('express-zip');
var cookieParser = require('cookie-parser');
const fileUtils = require('./fileUtils');
const CoinbasePro = require('coinbase-pro');
var publicClient = new CoinbasePro.PublicClient();
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/site'));
app.use(cookieParser());

//move to trading website repo

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
        else res.redirect(`/analytics?demo=1&id=ALPHAUSDT&indicator=EMA&rule=50&factor=1&platform=binance`)
    } else {
        res.sendFile(__dirname + '/site/home.html')
    }
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
                open: Number(item['open'] || item['price']),
                close: Number(item['close'] || item['price']),
                high: Number(item['high'] || item['price']),
                low: Number(item['low'] || item['price']),
                time: Number(item['time'])
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

        //console.log(result['array'][result['array'].length - 1])

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

app.get('/analytics', function (req, res) {
    //console.log(req.connection)
    const cookie = req.cookies
    const portfolio = req.query['portfolio'] || cookie['btpv']
    res.sendFile(__dirname + '/site/analytics.html');
})

app.get('/data.json', function (req, res) {
    const portfolio = req.query['portfolio']
    const demo = req.query['demo'] === '1' || false
    if (!demo) {
        res.sendFile(__dirname + `/data/${req.query['pair']}-data.json`);
    } else res.sendFile(__dirname + `/data/tests/${req.query['pair']}_test.json`);
    //res.download(__dirname + '/data.json')
})

app.get('/products', async function (req, res) {
    const platform = req.query['platform']
    if (platform === 'coinbase') {
        var data = await new Promise((resolve, reject) => {
            publicClient.getProducts((err, response, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
        res.send(data)
    } else if (platform === 'binance') {
        var data = await fetch('https://api.binance.com/api/v3/exchangeInfo')
            .then(async resp => {
                const data = await resp.json()
                return data['symbols']
            })
            .catch(e => {
                console.log(e)
            })
        data.map(item => {
            item['id'] = item['symbol']
            return item
        })
        res.send(data)
    }
    //res.download(__dirname + '/data.json')
})

app.get('/allProfits', async function (req, res) {
    const allProfits = await fileUtils.loadFile('./data/tests/allProfits.json')
    var array = []
    for (var a in allProfits) {
        //for each currency
        if (req.query['id'] && req.query['id'] !== a) continue
        //const max = Math.max.apply(Math, allProfits[a].map(function(item) { return Number(parseFloat(item['generalProfit'])); }))
        for (var c in allProfits[a]) {
            if (allProfits[a][c]['profit'] <= (Number(req.query['profit']) || 5)) continue
            //else if (parseFloat(allProfits[a][c]['trades']['ratio']) < 1) continue
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
        //return parseFloat(b['data']['profit']) - parseFloat(a['data']['profit'])
        return parseFloat(b['data']['trades']['ratio']) - parseFloat(a['data']['trades']['ratio']) || parseFloat(b['data']['profit']) - parseFloat(a['data']['profit']);
    })
    res.send(array)
    //res.download(__dirname + '/data.json')
})

app.get('/maxmin', async function (req, res) {
    var data = await fileUtils.loadData(req.query['pair'], req.query['platform'].toUpperCase())
    var timeframe = new Date()
    timeframe.setHours(timeframe.getHours() - 24 * 3) //3 days
    data = data.filter(item => Number(item['timestamp']) >= timeframe.getTime())
    data = data.map(item => Number(item['price']))
    res.send({
        max: Math.max(...data),
        min: Math.min(...data),
        difference: Math.max(...data) / Math.min(...data)
    })
})


//trading view listener
app.post('/action', async (req, res) => {
    console.log(req.body, req.params, req.query)

    res.json({
        status: 'success'
    })
});


app.get('*', function (req, res) {
    console.log(req.originalUrl)
    res.send('not found')
    //res.redirect('/shop/')
    //res.download(__dirname + '/data.json')
})



http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337')
});