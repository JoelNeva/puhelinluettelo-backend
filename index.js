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

const PORT = 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})