require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
app.use(morgan('tiny'))

app.use(express.static('build'))

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-532323232",
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})


app.post('/api/persons', (request, response) => {
  const body = request.body

    console.log(body.name)
    console.log(body.number)

  if (!body.name) {
    return response.status(400).json({ error: 'name is missing' })
} else if (!body.number) {
    return response.status(400).json({ error: 'number is missing' })
} else if (persons.some(p => p.name === body.name))
    return response.status(400).json({ error: 'name must be unique'})

  const person = new Person({
    name: body.name,
    number: body.number,
  }) 


  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {

    response.send(`Phonebook has info for ${persons.length} people <br> ${new Date()}`)

})

app.get('/api/persons/:id', (request, response) => {

  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person.toJSON())
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})