require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Person = require('./models/person')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

//Morgan Logging
morgan.token('requestBody', request => JSON.stringify(request.body))
app.use(morgan((tokens, req, res) => {
  let customTokens = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]

  if (req.method === 'POST') {
    customTokens = customTokens.concat(tokens.requestBody(req, res))
  }

  return customTokens.join(' ')
}))

//MongoDB Connect
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => {
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

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    if (!person) {
      response.status(404).end()
    } else {
      response.json(person)
    }
  }).catch(error => next(error))
})

app.get('/api/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p>
      <p>${Date().toString()}</p>`
    )
  })
})

app.post('/api/persons', (request, response, next) => {
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

  Person.find({ name: body.name }).then(responsePersonArray => {
    if(responsePersonArray.length > 0){
      return response.status(400).json({
        error: 'name must be unique'
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number
    })

    person.save().then(responsePerson => {
      response.json(responsePerson)
    }).catch(error => next(error))
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(person => {
    if (!person) {
      response.status(404).end()
    } else {
      response.status(204).end()
    }
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
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

  Person.findById(id).then(person => {
    if (!person) {
      return response.status(404).end()
    }

    person.name = body.name
    person.number = body.number

    return person.save().then(updatePerson => {
      response.json(updatePerson)
    })
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})