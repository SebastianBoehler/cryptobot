const brain = require('brain.js')
const fileUtils = require('./fileUtils');
var {
    generateIndicators
} = require('./futures/indicators');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

forecast('BTCUSDTPERP', 'BINANCE', 1)

async function forecast(id, platform, granularity, factor, values) {
    if (!factor) factor = 1
    if (granularity >= 5) return []
    const result = await new Promise(async (resolve, reject) => {
        var data = await generateIndicators(1, 'BTCUSDTPERP', 1);
        var array = data
        //array3min = array3min.filter(item => item['fiftyfive'] !== undefined)
        var start = new Date()
        start.setHours(start.getHours() - 36)
        console.log(data)
        data = data.filter((item, a) => Number(item['time']) >= start.getTime() && a < (data.length - values))
        console.log('training with data since', new Date(Number(data[0]['time'])).toLocaleString())

        const max = Math.max(...data.map(item => item['high']))
        const min = Math.min(...data.map(item => item['low']))
        const diff = max - min

        data = data.map(item => {
            return {
                open: (Number(item['open']) - min) / diff,
                close: (Number(item['close']) - min) / diff,
                high: (Number(item['high']) - min) / diff,
                low:(Number(item['low']) - min) / diff
            }
        })
        console.log('data length', data.length)

        const net = new brain.recurrent.LSTMTimeStep({
            inputSize: 4,
            outputSize: 4,
            hiddenLayers: [8, 12, 8] //length amount of layers, value amount of neurons
        });
        var trainingData = []

        const splitter = 15

        for (var a = 0; a < data.length; a = a + splitter) {
            trainingData.push(data.slice(a, a + splitter))
        }

        console.log('trainingdata',trainingData[0][0])

        //down scale
        //console.log('start training')

        net.train(trainingData, {
            learningRate: 0.005,
            errorThresh: 0.01,
            logPeriod: 500, 
            //iterations: 4000
            log: (stats) => console.log(stats)
        })

        console.log('done training')
        //console.log(data.slice(data.length - 201, data.length - 1))

        var forecast = net.forecast(data.slice(data.length - 201, data.length - 1), values || 100);

        console.log(forecast[0])
        forecast = forecast.map(item => {
            return {
                open: item['open'] * diff + min,
                close: item['close'] * diff + min,
                high: item['high'] * diff + min,
                low: item['low'] * diff + min
            }
        })
        //console.log('AI forecast', forecast)
        //console.log('real data', array.filter(item => Number(item['time']) >= end.getTime()).slice(0, 3))
        resolve(forecast)
    })

    //console.log(result)
    return result
}

module.exports = {
    forecast
}