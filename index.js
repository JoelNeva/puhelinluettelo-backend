const express = require('express')
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

app.use(express.json())

app.get('/api/persons', (request, response) => {
    console.log(persons)
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person === undefined) {
        response.status(404).end()
    } else {
        response.json(person)
    }

})

app.get('/api/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${Date().toString()}</p>`
    )
})

app.post('/api/persons', (request, response) => {
    console.log(request.headers)
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

    if(persons.find(person => person.name === body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * Math.pow(2,32))
    }
    persons = persons.concat(person)
    console.log(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    console.log(`trying to delete id:${id}`)
    const person = persons.filter(person => person.id === id)
    if (!person[0]) {
        console.log(`Person with id:${id} not found`)
        response.status(404).end()
    } else {
        persons = persons.filter(person => person.id !== id)
        console.log(persons)
        response.status(204).end()
    }
})

const PORT = 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})