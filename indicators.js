var technicalIndicators = require('technicalindicators');
const crypto = require('crypto');
const fileUtils = require('./fileUtils')
//technicalIndicators.setConfig('precision', 8);

module.exports = {
    generateIndicators: async function (indicator, granularity, array, returnArray, factor) {
        //granularity sets x min chart
        //console.log('granularity', granularity, array.length)
        //console.log(id)
        let steps = {
            'eight': parseInt(8 * factor),
            'thirteen': parseInt(13 * factor),
            'twentyone': parseInt(21 * factor),
            'fiftyfive': parseInt(55 * factor)
        }

        return new Promise(async (resolve, reject) => {
            let localArray = [] //= array.filter((x, i) => i % granularity == 0)
            //console.log(array[array.length - 1])
            //console.log('indicator',array.length, granularity)
            for (var c = 0; c < array.length; c = c + granularity) {
                if (granularity !== 1) {
                    var endValue
                    if (array[c + granularity]) endValue = array[c + granularity]['time']
                    else endValue = array[array.length - 1]['time']
                    var tempArray = array.filter(item => Number(item['time']) <= Number(endValue) && Number(item['time']) > Number(array[c]['time']))
                    if (granularity === 15) {
                        //console.log('temp array range', array[c]['id'], tempArray[tempArray.length - 1]['id'], tempArray.length)
                        //console.log('temp array length', tempArray.length)
                    }
                    if (tempArray.length === 0) continue
                    var latest = tempArray[tempArray.length - 1]
                    //item['id'] = tempArray[tempArray.length - 1]['id']
                    //item['price'] = tempArray[tempArray.length - 1]['price']
                    //item['time'] = tempArray[tempArray.length - 1]['time']
                    latest['open'] = Number(tempArray[0]['price'])
                    latest['close'] = Number(tempArray[tempArray.length - 1]['price'])
                    latest['high'] = Math.max(...tempArray.map(item => Number(item['high'] || item['price'])))
                    latest['low'] = Math.min(...tempArray.map(item => Number(item['low'] || item['price'])))
                    //latest['lows'] = tempArray.map(item => Number(item['low'] || item['price']))
                    //latest['ids'] = tempArray.map(item => item['id'])
                    localArray.push(latest)
                }
                //console.log(array[c])
                else localArray.push(array[c])
            }
            //console.log(localArray.length, granularity)

            //average Daily Volatility
            async function avrDailyVolatility() {
                var end = new Date(Number(array[array.length - 1]['time']))
                var values = []
                for (var f = 0; f < 90000; f + 24) {
                    var zero = new Date(Number(array[0]['time']))
                    zero.setHours(zero.getHours() + f)
                    var timeframe = new Date(zero.getTime())
                    timeframe.setHours(timeframe.getHours() + 24)
                    if (timeframe.getTime() >= end.getTime()) break
                    var max = Math.max(...array.filter(item => Number(item['time']) >= zero.getTime() && Number(item['time']) <= timeframe.getTime()))
                    var min = Math.min(...array.filter(item => Number(item['time']) >= zero.getTime() && Number(item['time']) <= timeframe.getTime()))
                    const diff = max / min
                    console.log(diff)
                    values.push(diff)
                }
                const average = values.reduce((a, b) => a + b) / values.length;
                return average
            }
            //fullArray['avrDailyVolatility'] = await avrDailyVolatility() ERROR

            var fullArray = {
                array: [],
                time: array[array.length - 1]['time'],
                upTrendPattern: await detectPattern(array.map(item => Number(item['price'])))
            }

            async function detectPattern(array) {
                var data = array.slice(array.length - 45 * granularity, array.length)
                var index = 0
                var prev = {
                    max: undefined,
                    min: undefined
                }
                for (var f = 0; f < data.length; f = f + 5) {
                    var max = Math.max(...data.slice(f, f + 5))
                    var min = Math.min(...data.slice(f, f + 5))
                    if (prev['max']) {
                        if (max > prev['max']) index++
                        if (min > prev['min']) index++

                        if (max < prev['max'] && min < prev['min']) index--
                    }
                    prev['max'] = max
                    prev['min'] = min
                }
                return index
            }

            //console.log(localArray)

            localArray.forEach(async (item, a) => {
                //var timeframe = array.filter(item => Number(item['time']) <= Number(localArray[a]['time']))
                //console.log(timeframe.length)
                item['time'] = item['timestamp'] || item['time']
                delete item['timestamp']
                //console.log(item)
                fullArray['array'].push(item)
            })

            //console.log(crypto.createHash('sha1').update(JSON.stringify(array)).digest('hex'))

            for (var b in steps) {
                if (!indicator) break
                var results = [];
                var technicalIndicator
                if (indicator === 'EMA') technicalIndicator = technicalIndicators.EMA
                else if (indicator === 'SMA') technicalIndicator = technicalIndicators.SMA
                else technicalIndicator = technicalIndicators.EMA
                var technicalIndicator = new technicalIndicator({
                    period: steps[b],
                    values: [],
                    //reversedInput: true
                });
                localArray.forEach((item, index) => {
                    var result = technicalIndicator.nextValue(Number(item['price']));
                    if (result) {
                        results.push(result)
                    }
                })

                fullArray['array'].reverse()
                results = results.reverse()
                for (var a = 0; a < results.length; a++) {
                    fullArray['array'][a][b] = results[a]
                }
                fullArray['array'].reverse()
            }

            var lineArray = fullArray['array'].map(item => item['fiftyfive'])

            //fullArray['array'] = fullArray['array'].reverse()
            //console.log('eight', fullArray['array'][fullArray['array'].length - 1]['eight'])

            fullArray['eight'] = fullArray['array'][fullArray['array'].length - 1]['eight']
            fullArray['thirteen'] = fullArray['array'][fullArray['array'].length - 1]['thirteen']
            fullArray['twentyone'] = fullArray['array'][fullArray['array'].length - 1]['twentyone']
            fullArray['fiftyfive'] = fullArray['array'][fullArray['array'].length - 1]['fiftyfive']
            fullArray['difference'] = Number(fullArray['eight'] / fullArray['fiftyfive']).toFixed(3)
            fullArray['indicator'] = indicator
            fullArray['type'] = `${granularity}Min${indicator}`
            fullArray['price'] = Number(array[array.length - 1]['price'])
            fullArray['change15min'] = await change(array, 15)
            fullArray['change1h'] = await change(array, 60)
            fullArray['change1d'] = await change(array, 60 * 24)
            fullArray['change3d'] = await change(array, 60 * 24 * 3)
            fullArray['change7d'] = await change(array, 60 * 24 * 7)
            fullArray['upTrend'] = await change(array, 5) > 1 && await change(array, 15) > 1 && await change(array, 25) > 1

            //console.log('eight', fullArray['array'][fullArray['array'].length - 1]['eight'])

            var RSI = technicalIndicators.RSI.calculate({
                values: localArray.map(item => Number(item['price'])),
                period: 14
            })

            //console.log('eight', fullArray['array'][fullArray['array'].length - 1]['eight'])

            fullArray['RSI'] = RSI[RSI.length - 1]
            //console.log(RSI[0])
            if (returnArray) {
                fullArray['array'] = await addArray(fullArray['array'], RSI.map((item, a) => {
                    const crossUp = technicalIndicators.CrossUp.calculate({
                        lineA: RSI.slice(a - 10, a),
                        lineB: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
                    })
                    const crossDown = technicalIndicators.CrossDown.calculate({
                        lineA: RSI.slice(a - 10, a),
                        lineB: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70]
                    })
                    //console.log(crossUp[crossUp.length - 1])
                    return item = {
                        'RSI': {
                            val: Number(item),
                            crossUp: crossUp[crossUp.length - 1],
                            crossDown: crossDown[crossDown.length - 1]
                        }
                    }
                }))
            }

            //console.log('eight', fullArray['array'][fullArray['array'].length - 1]['eight'])


            //console.log(fullArray['array'][fullArray['array'].length - 1])

            var lineArray = localArray.map(item => Number(item['fiftyfive']))
            lineArray = lineArray.slice(lineArray.length - 7, lineArray.length)
            const lineMove = await lineMoving()
            var lineTrend = 0

            if (lineMove['count'] >= lineMove['length'] * 0.75) lineTrend = 1
            else if (lineMove['count'] <= lineMove['length'] * 0.5) lineTrend = -1

            fullArray['lineMoving'] = lineTrend
            fullArray['moving'] = Number(Math.max(...lineArray.slice(lineArray.length - 26, lineArray.length - 2)) / Math.min(...lineArray.slice(lineArray.length - 26, lineArray.length - 2))).toFixed(5)
            resolve(fullArray)
            return

            async function lineMoving() {
                return new Promise((resolve, reject) => {
                    var count = 0
                    var previous = undefined
                    for (var a in lineArray) {
                        if (!previous) previous = lineArray[a]
                        else {
                            if (lineArray[a] > previous) count++
                            previous = lineArray[a]
                        }
                    }
                    resolve({
                        count: count,
                        length: lineArray.length
                    })
                })
            }

            async function change(array, min) {
                //console.log('array', typeof array)
                var price = Number(array[array.length - 1]['price'])
                var time = new Date()
                time.setMinutes(time.getMinutes() - min)

                var timeframe = array.filter(item => Number(item['time']) <= time.getTime())
                if (timeframe.length >= 1) array = timeframe
                else array = [
                    array[0]
                ]
                var lastprice
                if (array.length >= 1) lastprice = Number(array[array.length - 1]['price'])
                else return 1

                const change = Number(price / lastprice)

                return change
            }

            async function addArray(array1, localArray) {
                array1.reverse()
                localArray.reverse()

                if (array1.length <= 1) return []

                for (var a in localArray) {
                    for (var object in localArray[a]) {
                        array1[a][object] = localArray[a][object]
                    }
                }

                array1.reverse()
                return array1
            }
        })

    }
}