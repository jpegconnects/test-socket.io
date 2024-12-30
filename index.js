const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors')
const chatbot = require('./chatbot.js')
const { queue, agregarAgenteDisponible, agenteTomoVideollamada, agenteOcupado } = require('./cola')
const routerSendMessage = require('./sendMessage.js')

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: '*'
}))

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// esta ruta es para cuando un agente toma una videollamada sin estar disponible
app.post('/videollamada-tomada', (req, res) => {

  const {meet, idAgent} = req.body

  agenteTomoVideollamada(idAgent)

  io.emit('videollamada tomada', '' + meet);

  res.send('videollamada tomada')
})

app.get('/asignar-agente', (req, res) => {

  const response = queue()

  io.emit('asignar agente', response);
  
  res.send('asignar agente')
})

app.get('/activar-agente', (req, res) => {

  const {agente} = req.query

  const response = agregarAgenteDisponible(agente)

  io.emit('agente disponible', response);
  
  res.send('agente disponible')
})

app.get('/agente-ocupado', (req, res) => {
  
  const {name} = req.query

  const response = agenteOcupado(name)

  io.emit('agente ocupado', response);

  res.send('agente ocupado')
})

app.use('/', chatbot)
app.use('/', routerSendMessage)

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
