const fs = require('fs');
const firebase = require('firebase');
var mysql = require('mysql')

var firebaseConfig = {
    apiKey: "AIzaSyC2TznHVVCxe28MOuIsrInQgoR_wiCQW7c",
    authDomain: "trading-bot-12d59.firebaseapp.com",
    databaseURL: "https://trading-bot-12d59.firebaseio.com",
    projectId: "trading-bot-12d59",
    storageBucket: "trading-bot-12d59.appspot.com",
    messagingSenderId: "980638388353",
    appId: "1:980638388353:web:d1e2e66c6448611249fd80",
    measurementId: "G-6Z7D7YB5CY"
}

let connection = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'crypto'
})
let connection2 = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'crypto2'
})
let connection3 = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'ftx'
})
let connection4 = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'ruletester'
})


module.exports = {
    requireUncached: function (module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    },

    loadFile: async function (path) {
        return new Promise(async (resolve, reject) => {
            var data = await fs.promises.readFile(path, 'utf-8')
            try {
                data = JSON.parse(data)
                resolve(data)
            } catch (error) {
                console.log(error)
                reject()
            }

        })
    },

    loadData: async function (id, platform, option, since, index) {
        //console.log(id,platform)
        var createTable = false
        return new Promise(async (resolve, reject) => {
            if (!id) {
                reject('no id provided')
                return
            }
            let sql = ''
            if (platform === 'COINBASE') {
                connection.query(sql, (err, result) => {
                    //if (err) console.log(err)
                    //else console.log(result)
                    if (!err && result) {
                        console.log('created table', id)
                        createTable = true
                    }
                })
                if (createTable) {
                    reject()
                    return
                }
                sql = `SELECT * FROM ${id.replace('-', '_')}`
                if (option === 'latest') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id DESC LIMIT 3) sub ORDER BY id ASC`
                else if (option === 'oldest') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id ASC LIMIT 3) sub ORDER BY id ASC`
                else if (typeof option === 'number') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id DESC LIMIT ${option}) sub ORDER BY id ASC`
                else if (typeof since === 'number') sql = `SELECT * FROM ${id.replace('-', '_')} WHERE time > ${since}`
                connection.query(sql, (error, rows, fields) => {
                    if (error) {
                        console.log(error['code'])
                        let createSQL = `CREATE TABLE ${id.replace('-', '_')}(id int AUTO_INCREMENT, price VARCHAR(255), volume VARCHAR(255), time VARCHAR(255), bid VARCHAR(255), ask VARCHAR(255), open VARCHAR(255), close VARCHAR(255), high VARCHAR(255), low VARCHAR(255), PRIMARY KEY (id))`
                        connection.query(createSQL, (err, result) => {
                            if (err && err['code'] !== 'ER_TABLE_EXISTS_ERROR') console.log(err)
                            //else console.log(result)
                            if (!err && result) {
                                console.log('created table', id)
                                createTable = true
                            }
                        })
                        reject(error)
                    } else {
                        //console.log('fields', fields)
                        //console.log('rows', rows.length)
                        resolve(rows)
                    }
                })
            } else if (platform === 'BINANCE') {
                sql = `SELECT * FROM ${id.replace('-', '')}`
                if (option === 'latest') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id DESC LIMIT 3) sub ORDER BY id ASC`
                else if (option === 'oldest') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id ASC LIMIT 3) sub ORDER BY id ASC`
                else if (typeof option === 'number') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id DESC LIMIT ${option}) sub ORDER BY id ASC`
                else if (typeof since === 'number') sql = `SELECT * FROM ${id.replace('-', '_')} WHERE time > ${since}`
                else if (index) sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} WHERE id BETWEEN ${index - option || 100000} AND ${index}) sub ORDER BY id ASC`
                //console.log(index, sql)
                connection2.query(sql, (error, rows, fields) => {
                    if (error) {
                        console.log(error['code'])
                        let createSQL = `CREATE TABLE ${id.replace('-', '_')}(id int AUTO_INCREMENT, price VARCHAR(255), volume VARCHAR(255), time VARCHAR(255), bid VARCHAR(255), ask VARCHAR(255), open VARCHAR(255), close VARCHAR(255), high VARCHAR(255), low VARCHAR(255), PRIMARY KEY (id))`
                        connection2.query(createSQL, (err, result) => {
                            if (err && err['code'] !== 'ER_TABLE_EXISTS_ERROR') console.log(err)
                            //else console.log(result)
                            if (!err && result) {
                                console.log('created table', id)
                                createTable = true
                            }
                        })
                        reject(error)
                    } else {
                        //console.log('fields', fields)
                        //console.log('rows', rows.length)
                        resolve(rows)
                    }
                })
            } else if (platform === 'FTX') {
                sql = `SELECT * FROM ${id.replace('-', '_')}`
                if (option === 'latest') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id DESC LIMIT 3) sub ORDER BY id ASC`
                else if (option === 'oldest') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id ASC LIMIT 3) sub ORDER BY id ASC`
                else if (typeof option === 'number') sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} ORDER BY id DESC LIMIT ${option}) sub ORDER BY id ASC`
                else if (typeof since === 'number') sql = `SELECT * FROM ${id.replace('-', '_')} WHERE time > ${since}`
                else if (index) sql = `SELECT * FROM (SELECT * FROM ${id.replace('-', '_')} WHERE id BETWEEN ${index - option || 100000} AND ${index}) sub ORDER BY id ASC`
                //console.log(index, sql)
                connection3.query(sql, (error, rows, fields) => {
                    if (error) {
                        console.log('in fileUtils',error['code'])
                        let createSQL = `CREATE TABLE ${id.replace('-', '_')}(id int AUTO_INCREMENT, price VARCHAR(255), volume VARCHAR(255), time VARCHAR(255), bid VARCHAR(255), ask VARCHAR(255), open VARCHAR(255), close VARCHAR(255), high VARCHAR(255), low VARCHAR(255), PRIMARY KEY (id))`
                        connection3.query(createSQL, (err, result) => {
                            if (err && err['code'] !== 'ER_TABLE_EXISTS_ERROR') {
                                console.log(err)
                            }
                            if (err) {
                                reject(err)
                                return
                            }
                            //else console.log(result)
                            if (!err && result) {
                                console.log('created table', id)
                                createTable = true
                                reject('created table')
                            }
                        })
                    } else {
                        //console.log('fields', fields)
                        //console.log('rows', rows.length)
                        resolve(rows)
                    }
                })
            }
            //console.log('end connection')
            //connection.end()
        })
    },

    pushData: async function (id, data, platform) {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO ${id.replace('-', '_')} SET ?`
            //console.log(data['price'])
            var body = {}
            for (var a in data) {
                body[a] = data[a]
            }

            if (platform === 'COINBASE') {
                if (false) {
                    connection.query(`ALTER TABLE ${id.replace('-', '_')} ADD COLUMN open VARCHAR(255) NOT NULL, ADD COLUMN close VARCHAR(255) NOT NULL, ADD COLUMN high VARCHAR(255) NOT NULL, ADD COLUMN low VARCHAR(255) NOT NULL;`, body, (err, result) => {
                        if (err) {
                            console.log(err.name)
                            //reject(err)
                        }
                        else console.log('created new columns')
                        //else console.log(result)
                    })
                }
                connection.query(sql, body, (err, result) => {
                    if (err) reject(err)
                    else resolve()
                    //else console.log(result)
                })
            } else if (platform === 'BINANCE') {
                if (false) {
                    connection2.query(`ALTER TABLE ${id.replace('-', '_')} ADD COLUMN open VARCHAR(255) NOT NULL, ADD COLUMN close VARCHAR(255) NOT NULL, ADD COLUMN high VARCHAR(255) NOT NULL, ADD COLUMN low VARCHAR(255) NOT NULL;`, body, (err, result) => {
                        if (err) {
                            console.log(err.name)
                            //reject(err)
                        }
                        else console.log('created new columns')
                        //else console.log(result)
                    })
                }
                connection2.query(sql, body, (err, result) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                    else resolve()
                    //else console.log(result)
                })
            } else if (platform === 'FTX') {
                if (false) {
                    connection2.query(`ALTER TABLE ${id.replace('-', '_')} ADD COLUMN open VARCHAR(255) NOT NULL, ADD COLUMN close VARCHAR(255) NOT NULL, ADD COLUMN high VARCHAR(255) NOT NULL, ADD COLUMN low VARCHAR(255) NOT NULL;`, body, (err, result) => {
                        if (err) {
                            console.log(err.name)
                            //reject(err)
                        }
                        else console.log('created new columns')
                        //else console.log(result)
                    })
                }
                connection3.query(sql, body, (err, result) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                    else resolve()
                    //else console.log(result)
                })
            }
        })
    },

    removeData: async function (id, object, platform) {
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM ${id.replace('-', '_')} WHERE id = ${object}`
            if (platform === 'COINBASE') {
                connection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                    else {
                        //console.log(result)
                        console.log('removed object from database', id)
                        resolve()
                    }
                    //else console.log(result)
                })
            } else if (platform === 'BINANCE') {
                connection2.query(sql, (err, result) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                    else {
                        //console.log(result)
                        console.log('removed object from database', id)
                        resolve()
                    }
                    //else console.log(result)
                })
            } else if (platform === 'FTX') {
                connection3.query(sql, (err, result) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                    else {
                        //console.log(result)
                        console.log('removed object from database', id)
                        resolve()
                    }
                    //else console.log(result)
                })
            }
        })
    },
    checkSchema: async function(hardwareID) {
        hardwareID = hardwareID.split('-').join('_')
        return new Promise(async (resolve, reject) => {
            let sql = `SELECT * FROM ${hardwareID}`
            connection4.query(sql, (error, rows, fields) => {
                if (error) {
                    console.log('table not found',error.message)
                    let createSQL = `CREATE TABLE ${hardwareID}(id int AUTO_INCREMENT, idx VARCHAR(200), symbol TEXT, orderID TEXT, time VARCHAR(255), side TEXT, price DECIMAL(65, 30), status TEXT, data LONGTEXT, PRIMARY KEY (id))`
                    connection4.query(createSQL, (err, result) => {
                        if (!err && result) {
                            console.log('created table', hardwareID)
                            resolve()
                            //createTable = true
                        } else {
                            console.log(err)
                            reject()
                        }
                    })
                    //reject(error)
                } else {
                    //console.log('fields', fields)
                    //console.log('rows', rows.length)
                    resolve('schema found')
                }
            })
        })
    },

    getAllIndexTransactions: async function(hardwareID, index) {
        //console.log('load all trx index', index)
        if (!hardwareID) log.error(hardwareID, 'is undefined')
        hardwareID = hardwareID.split('-').join('_')
        return new Promise(async (resolve, reject) => {
            let sql = `SELECT data FROM ${hardwareID} WHERE idx = ${index}` 
            if (!index) sql =  `SELECT data FROM ${hardwareID} WHERE idx IS NULL` 
            connection4.query(sql, (error, rows, fields) => {
                if (error) {
                    console.trace('my sql error',error.message)
                    reject(error.message)
                    
                    //reject(error)
                } else {
                    //console.log('fields', fields)
                    //console.log('rows index trxs', rows.length)
                    rows = rows.map(item => JSON.parse(item['data']))
                    rows.sort(function (a, b) {
                        return a['time'] - b['time']
                    })
                    resolve(rows)
                }
            })
        })
    },

    getAllTickerTransactions: async function(hardwareID, ticker) {
        //sconsole.log('get all ticker trxs', ticker)
        hardwareID = hardwareID.split('-').join('_')
        return new Promise(async (resolve, reject) => {
            let sql = `SELECT data FROM ${hardwareID} WHERE symbol = '${ticker}'` 
            connection4.query(sql, (error, rows, fields) => {
                if (error) {
                    console.log('error',error.message)
                    
                    reject(error.message)
                } else {
                    //console.log('fields', fields)
                    //console.log('rows', rows.length)
                    rows = rows.map(item => JSON.parse(item['data']))
                    rows.sort(function (a, b) {
                        return a['time'] - b['time']
                    })
                    resolve(rows)
                }
            })
        })
    },

    getAllTransactions: async function(hardwareID) {
        console.log('load all trxs')
        hardwareID = hardwareID.split('-').join('_')
        return new Promise(async (resolve, reject) => {
            let sql = `SELECT data FROM ${hardwareID}` 
            connection4.query(sql, (error, rows, fields) => {
                if (error) {
                    console.log('error',error.message)
                    reject(error.message)
                    
                    //reject(error)
                } else {
                    //console.log('fields', fields)
                    //console.log('rows', rows.length)
                    rows = rows.map(item => JSON.parse(item['data']))
                    rows.sort(function (a, b) {
                        return a['time'] - b['time']
                    })
                    resolve(rows)
                }
            })
        })
    },

    getAllIndexes: async function(hardwareID) {
        console.log('load all trxs')
        hardwareID = hardwareID.split('-').join('_')
        return new Promise(async (resolve, reject) => {
            let sql = `SELECT idx FROM ${hardwareID}` 
            connection4.query(sql, (error, rows, fields) => {
                if (error) {
                    console.log('error',error.message)
                    reject(error.message)
                    
                    //reject(error)
                } else {
                    rows = rows.map(item => +item['idx'] || item['idx'])
                    resolve(rows)
                }
            })
        })
    },

    getTransactionByOrderID: async function(hardwareID, orderID) {
        console.log('load trx with orderID', orderID)
        hardwareID = hardwareID.split('-').join('_')
        return new Promise(async (resolve, reject) => {
            let sql = `SELECT data FROM ${hardwareID} WHERE orderID = '${orderID}'` 
            connection4.query(sql, (error, rows, fields) => {
                if (error) {
                    console.log('error',error.message)
                    reject(error.message)
                    
                    //reject(error)
                } else {
                    //console.log('fields', fields)
                    console.log('rows', rows.length)
                    rows = rows.map(item => JSON.parse(item['data']))
                    rows.sort(function (a, b) {
                        return a['time'] - b['time']
                    })
                    resolve(rows)
                }
            })
        })
    },

    writeTransaction: async function (hardwareID, data) {
        if (!data) {
            console.error('no data write transaction')
            return
        }
        //console.log('write transaction', data['orderId'], data['time'], data['clientOrderId'] ? data['clientOrderId'] : data)
        hardwareID = hardwareID.split('-').join('_')
        //console.log('write transaction price', +data['price'])
        let body = {
            idx: data['index'],
            symbol: data['symbol'],
            time: +data['time'],
            price: data['avgPrice'] === 0 ? +data['price'] : +data['avgPrice'],
            side: data['action'],
            orderID: data['clientOrderId'] || data['orderId'],
            status: data['status'],
            data: JSON.stringify(data['data'])
        }
        return new Promise(async (resolve, reject) => {
            let sql = `INSERT INTO ${hardwareID} SET ?`
            connection4.query(sql, body , (error, rows, fields) => {
                if (error) {
                    console.log('error uploading sql',error.message)
                    reject(error)
                    //reject(error)
                } else {
                    //console.log('fields', fields)
                    console.log('uploaded data')
                    resolve()
                }
            })
        })
    },
    //mysql_query("Update login SET nameOfYourColumn = '$cleanURL' WHERE primaryKey = idOfRowToUpdate")
    updateTransaction: async function (hardwareID, data) {
        hardwareID = hardwareID.split('-').join('_')
        //console.log('write transaction price', +data['price'])
        let body = {
            idx: data['index'],
            symbol: data['symbol'],
            time: +data['time'],
            price: data['avgPrice'] === 0 ? +data['price'] : +data['avgPrice'],
            side: data['action'],
            orderID: data['clientOrderId'] || data['orderId'],
            status: data['status'],
            data: JSON.stringify(data)
        }
        console.log('update transaction', body['orderID'], data['time'])
        return new Promise(async (resolve, reject) => {
            let sql = `UPDATE ${hardwareID} SET data = '${JSON.stringify(data)}' WHERE orderID = '${body['orderID']}'`
            connection4.query(sql, (error, rows, fields) => {
                if (error) {
                    console.log('error updating sql',error.message)
                    reject(error)
                    //reject(error)
                } else {
                    //console.log('fields', fields)
                    console.log('uploaded data')
                    resolve()
                }
            })
        })
    },
}

async function createDatabase(name) {
    console.log('create Database', name)
    let sql = `CREATE DATABASE ${name}`
    return new Promise((resolve, reject) => {
        connection.query(sql, (error, result) => {
            if (error) {
                console.log('seems liek db already exists')
                reject(error)
            } else {
                console.log('created database', name)
                resolve()
            }
        })
    })
}
