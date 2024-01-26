const fileUtils = require('../fileUtils');
const crypto = require('crypto');

//console.log(crypto.createHash('sha256').update(JSON.stringify(history.map(item => item['price']))).digest('hex'))

class indicators {
    constructor(array) {
        this.history = array
    }

    setGranularity(granularity) {
        let localArray = [] //= this.history.filter((x, i) => i % granularity == 0)
        for (var c = 0; c < this.history.length; c = c + granularity) {
            if (granularity !== 1) {
                var endValue
                if (this.history[c + granularity]) endValue = this.history[c + granularity]['time']
                else endValue = this.history[this.history.length - 1]['time']
                var tempArray = this.history.filter(item => Number(item['time']) <= Number(endValue) && Number(item['time']) > Number(this.history[c]['time']))
                if (tempArray.length === 0) continue
                var latest = tempArray[tempArray.length - 1]
                //item['id'] = tempArray[tempArray.length - 1]['id']
                //item['price'] = tempArray[tempArray.length - 1]['price']
                //item['time'] = tempArray[tempArray.length - 1]['time']
                latest['open'] = tempArray[0]['price']
                latest['close'] = tempArray[tempArray.length - 1]['price']
                //latest['high'] = Math.max(...tempArray.map(item => Number(item['high'] || item['price'])))
                //latest['low'] = Math.min(...tempArray.map(item => Number(item['low'] || item['price'])))
                //latest['lows'] = tempArray.map(item => Number(item['low'] || item['price']))
                //latest['ids'] = tempArray.map(item => item['id'])
                localArray.push(latest)
            }
            //console.log(this.history[c])
            else localArray.push(this.history[c])
        }
        this.history = localArray
        console.log(this.history.length)
    }
};


(async () => {
    const history = await fileUtils.loadData('BTCUSDT' + 'PERP', 'BINANCE')
        .catch(e => {
            console.error(e)
            return undefined
        })

    console.log(crypto.createHash('sha256').update(JSON.stringify(history)).digest('hex'))
    console.log(history[history.length - 1])
    let myIndicators = new indicators(history)
    await myIndicators.setGranularity(90)
    console.log(crypto.createHash('sha256').update(JSON.stringify(history)).digest('hex'))
    console.log(history[history.length - 1])
});

(async () => {
    console.log(crypto.createHash('sha1').update(JSON.stringify(history)).digest('hex'))
    var data = await generate(history)
    console.log(crypto.createHash('sha1').update(JSON.stringify(history)).digest('hex'))
    //console.log(history)

    async function generate() {
        return new Promise(async (resolve, reject) => {
            let array = await fileUtils.loadData('BTCUSDT' + 'PERP', 'BINANCE')
            .catch(e => {
                console.error(e)
                return undefined
            })
            array.push({
                hallo: 'test'
            })
            resolve(array)
        })
    }
})()