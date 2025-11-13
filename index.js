require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Person = require('./models/person')
const app = express()

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": "2"
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
    }
]

app.use(express.static('dist'))
app.use(express.json())

//Morgan Logging
morgan.token('requestBody', (request, response) => JSON.stringify(request.body))
app.use(morgan((tokens, req, res) => {
    let customTokens = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ]

    if (req.method === "POST") {
        customTokens = customTokens.concat(tokens.requestBody(req, res))
    }

    return customTokens.join(' ')
}))

//MongoDB Connect
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then(person => {
        if (person === undefined) {
            response.status(404).end()
        } else {
            response.json(person)
        }
    }).catch(error =>{
        console.log(error)
        response.status(400).send({error: 'malformatted id'})
    })
})

app.get('/api/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(
            `<p>Phonebook has info for ${persons.length} people</p>
            <p>${Date().toString()}</p>`
        )
    })
    
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if(!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }

    Person.find({name: body.name}).then(responsePersonArray => {
        if(responsePersonArray.length > 0){
            return response.status(400).json({
                error: 'name must be unique'
            })
        }

        const person = new Person({
            name: body.name,
            number: body.number
        })

        person.save().then(responsePerson =>{
            response.json(responsePerson)
        })
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findByIdAndDelete(id).then(person => {
        if (!person) {
            response.status(404).end()
        } else {
            response.status(204).end()
        }
    }).catch(error =>{
        console.log(error)
        response.status(400).send({error: 'malformatted id'})
    })
})

const PORT = process.env.PORT
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})