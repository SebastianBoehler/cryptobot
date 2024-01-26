var technicalIndicators = require('technicalindicators');
const fileUtils = require('./fileUtils');
technicalIndicators.setConfig('precision', 10);
const fs = require('fs')

class indicators {
    constructor() {
        this.storage = {}
        this.arrays = {}
    };

    async loadData(id, platform, since) {
        this.platform = platform
        return new Promise(async (resolve, reject) => {
            if (!this.data) {
                this.data = await fileUtils.loadData(id, platform.toUpperCase())
                .catch(e => {
                    console.log(e.name)
                    process.exit()
                })
                this.data = this.data.filter(item => item['open'] !== '')
            }
            this.id = id
            resolve()
        })
    };

    async loadIndicators() {
        let granularities = [5, 10, 15, 25]
        for (var a in granularities) {
            if (this.arrays && this.arrays[granularities[a].toString()]) continue
            let array = []
            for (var c = 0; c < this.data.length; c = c + granularities[a]) {
                if (granularities[a] !== 1) {
                    var endValue
                    var item = this.data[c]
                    let startIndex = this.data[c]['id']
                    if (this.data[c - granularities[a]]) startIndex = this.data[c - granularities[a]]['id']
                    var tempArray = this.data.filter(item2 => item2['id'] >= startIndex && item2['id'] <= item['id'])
                    if (tempArray.length === 0) continue
                    item['open'] = Number(tempArray[0]['price'])
                    item['close'] = Number(tempArray[tempArray.length - 1]['price'])
                    item['high'] = Math.max(...tempArray.map(item2 => Number(item2['high'] || item2['price'])))
                    item['low'] = Math.min(...tempArray.map(item2 => Number(item2['low'] || item2['price'])))
                    item['ids'] = tempArray.map(item2 => item2['id'])
                }
                //console.log(array[c])
                array.push(this.data[c])
            }
            this.arrays[granularities[a].toString()] = {}
            this.arrays[granularities[a].toString()]['array'] = array

            //remove this stuff **done
        }
    };

    async updateDatabase() {
        return new Promise(async (resolve, reject) => {
            for (var a in this.arrays) {
                let array = this.arrays[a]['array']
                let latest = array[array.length - 1]
                let granularity = Number(a)

                var expiraton = new Date(Number(latest['time']))
                expiraton.setSeconds(expiraton.getSeconds() + 60 * granularity)
                if (new Date().getTime() >= expiraton.getTime()) {
                    console.log('updateValues', new Date(Number(latest['time'])).toTimeString(), granularity)
                    var newData = await fileUtils.loadData(this.id, this.platform.toUpperCase(), 30)
                    .catch(e => {
                        console.log(e.name)
                        process.exit()
                    })
                    newData = newData.filter(item => item['id'] <= latest['id'] + granularity && item['id'] > latest['id'])
                    let newValue = newData[newData.length - 1]
                    if (!newValue['id']) continue
                    console.log('ids', latest['id'], newValue['id'], granularity)
                    console.log('temp array range', newData[0]['id'], newValue['id'], newData.length)
                    if (newValue['id'] > latest['id'] + granularity) console.log('failure!')
                    else if (newValue['id'] !== latest['id'] + granularity) continue
                    //else if (newData.length < 15) throw 'newData length smaller 15' + newData.length

                    newValue['open'] = latest['close']
                    newValue['high'] = Math.max(...newData.map(item => Number(item['high'])))
                    newValue['low'] = Math.min(...newData.map(item => Number(item['low'])))
                    newValue['ids'] = newData.map(item => item['id'])
                    newValue['lows'] = Math.min(...newData.map(item => Number(item['low'])))
                    this.arrays[a]['array'].push(newValue)

                    console.log('new value', newValue)

                    if (granularity === 15) {
                        fs.writeFileSync(`./${this.id}_array.json`, JSON.stringify(this.arrays[a]['array'].slice(this.arrays[a]['array'].length - 16, this.arrays[a]['array'].length - 1), null, 3), { encoding: 'utf-8' })
                    }
                }
            }
            resolve()
        })
    }

    async generate(granularity) {
        if (typeof granularity === 'number') granularity = granularity.toString()
        return new Promise(async (resolve, reject) => {
            let obj = {}
            let array = this.arrays[granularity]['array']

            console.log(array[0]['id'], new Date(Number(array[0]['time'])).toString())

            //console.log(this.arrays[granularity]['HeikinAshi']['array'])
            let HeikinAshi = new technicalIndicators.HeikinAshi.calculate({
                open: array.map(item => Number(item['open'])),
                close: array.map(item => Number(item['close'])),
                low: array.map(item => Number(item['low'])),
                high: array.map(item => Number(item['high']))
            })

            var index = HeikinAshi['open'].length - 1
            //console.log(index, obj['HeikinAshi']['open'][index])
            obj['HeikinAshi'] = {
                open: HeikinAshi['open'][index],
                close: HeikinAshi['close'][index],
                high: HeikinAshi['high'][index],
                low: HeikinAshi['low'][index]
            }

            let MACD = new technicalIndicators.MACD.calculate({
                values: HeikinAshi['close'],
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                SimpleMAOscillator: false,
                SimpleMASignal: false
            })

            obj['MACD'] = MACD[MACD.length -1]

            obj['origin'] = this.arrays[granularity]['array'][index]

            obj['EMA'] = {}
            obj['EMA']['fiftyfive'] = new technicalIndicators.EMA.calculate({
                period: 55,
                values: array.map(item => Number(item['price']))
            })

            var lineArray = obj['EMA']['fiftyfive']
            lineArray = lineArray.slice(lineArray.length - 7, lineArray.length)
            const lineMove = await lineMoving()
            var lineTrend = 0

            if (lineMove['count'] >= lineMove['length'] * 0.75) lineTrend = 1
            else if (lineMove['count'] <= lineMove['length'] * 0.5) lineTrend = -1

            obj['lineMoving'] = lineTrend

            obj['EMA']['fiftyfive'] = obj['EMA']['fiftyfive'][obj['EMA']['fiftyfive'].length - 1]

            const bollingerBand = technicalIndicators.BollingerBands.calculate({
                period: 14,
                values: array.map(item => Number(item['close'])),
                stdDev: 2
            })
            obj['BollingerBands'] = bollingerBand[bollingerBand.length - 1]

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
            resolve(obj)
        })
    };

    async validateDatabase() {
        for (var a in this.arrays['15']['array']) {
            if (!this.arrays['15']['array'][a + 1]) break
            else if (this.arrays['15']['array'][a]['id'] + 15 !== this.arrays['15']['array'][Number(a) + 1]['id']) {
                console.error('database invalid')
                throw 'database invalid!'
            }
        }
    }
}

module.exports = {
    indicators
}