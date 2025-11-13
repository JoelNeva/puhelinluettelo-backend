const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3
    },
    number: String,
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
