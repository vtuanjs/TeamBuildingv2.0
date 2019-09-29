const mongoose = require('mongoose')
const { MongoMemoryReplSet } = require('mongodb-memory-server')

mongoose.set('useFindAndModify', false);
const connect = async () => {
    try {
        let url = process.env.MONGO_URL
        let options = {
            connectTimeoutMS: 10000,
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        }
        if (process.env.NODE_ENV === 'test') {
            const replSet = new MongoMemoryReplSet({
                instanceOpts: [
                    { storageEngine: "wiredTiger" }
                ]
            });

            await replSet.waitUntilRunning();
            const uri = `${await replSet.getConnectionString()}?replicaSet=testset`;

            await mongoose.connect(
                uri,
                options
            );

            console.log('Connect database successfully!')
        } else {
            await mongoose.connect(url, options)
            console.log('Connect database successfully!')
        }
    } catch (error) {
        console.log(`Connect database error: ${error}`)
    }
}

const close = async () => {
    return mongoose.disconnect()
}

module.exports = { connect, close }