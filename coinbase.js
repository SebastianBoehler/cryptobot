let database
const CoinbasePro = require('coinbase-pro');
var publicClient = new CoinbasePro.PublicClient();
const fs = require('fs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const fileUtils = require('./fileUtils');

(async () => {
    allProducts = await new Promise((resolve, reject) => {
        publicClient.getProducts((err, response, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
    databaseGen()
})();

async function databaseGen() {

    for (var a in allProducts) {
        const id = allProducts[a]['id']
        if ((id.includes('USD') && !id.includes('USDC')) || id.includes('GBP')) continue

        var history = await fileUtils.loadData(id, 'COINBASE', 'latest')
            .catch(e => {
                console.log('error load Data', e)
            })
        if (false) {
            history = await fileUtils.loadFile(`./data/history/${id}_history.json`).catch(e => {
                console.log(e)
            })
            console.log(`pushing ${history.length} values`)
            for (var a in history) {
                await fileUtils.pushData(id, history[a])
            }
        }
        if (!history) history = []
        //console.log('history', history)

        var ago = new Date()
        //ago.setMinutes(ago.getMinutes() - 15)
        ago.setSeconds(ago.getSeconds() - 59)

        if (history.length >= 1 && Number(history[history.length - 1]['time']) > ago.getTime()) continue

        const product = await productTicker(id)
            .catch(e => {
                console.log(e)
                return undefined
            })

        //console.log(JSON.stringify(product, null, 2))

        console.log('id',id)
        console.log('history', history.length)

        if (!product || !product['price'] || product['price'] === null) {
            console.log('no data')
            continue
        }

        await editDatabase()

        async function editDatabase() {
            //console.log(id)
            const now = new Date()

            var expiration = new Date()
            expiration.setHours(expiration.getHours() - 6000) //14 Tage = 336

            var oldest = await fileUtils.loadData(id, 'COINBASE', 'oldest')
            .catch(e => {
                console.log('error load Data', e)
            })
            for (var d in oldest) {
                if (Number(oldest[d]['time']) < expiration.getTime()) {
                    await fileUtils.removeData(id, oldest[d]['id'], 'COINBASE')
                    .catch(e => {
                        console.log(e.name)
                    })
                }
            }

            var object = {
                //profit: obj['profit'],
                volume: Number(product['volume']),
                time: now.getTime(),
                price: Number(product['price']),
                bid: Number(product['bid']),
                ask: Number(product['ask']),
                open: '',
                close: '',
                high: '',
                low: ''
            }

            if (history.length === 0) {
                console.log('pushing new value')
                await fileUtils.pushData(id, object, 'COINBASE')
                .catch(e => {
                    console.log(e)
                })
            } else if (Number(history[history.length - 1]['time']) < ago.getTime()) {
                if (history.length >= 1) console.log('pushing new value', new Date(Number(history[history.length - 1]['time'])).toLocaleTimeString())
                await fileUtils.pushData(id, object, 'COINBASE')
                .catch(e => {
                    console.log(e)
                })
            }
        }
        //await sleep(300)
    }
    console.log('done')
    allProducts = await new Promise((resolve, reject) => {
        publicClient.getProducts((err, response, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
    databaseGen()
}

async function productTicker(currency) {
    return new Promise((resolve, reject) => {
        publicClient.getProductTicker(currency, (err, response, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}