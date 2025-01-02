const express = require('express');
const axios = require('axios')
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors')
const chatbot = require('./chatbot.js')
const { queue, agregarAgenteDisponible, agenteTomoVideollamada, agenteOcupado } = require('./cola')
const routerSendMessage = require('./sendMessage.js')
require('dotenv').config()

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
app.post('/videollamada-tomada', async (req, res) => {

  const {meet, idAgent, messageId, nameClient, insurance, idClient} = req.body

  agenteTomoVideollamada(idAgent)

  io.emit('videollamada tomada', {meet, idClient});

  let data = {
    BOT_ID: 231,
    CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
    DIALOG_ID: idAgent,
    MESSAGE_ID: messageId,
    KEYBOARD: [
        {
            "TEXT": "Entrar a la videollamada",
            "LINK": `https://b24-demo.bitrix24.site/preview/0c30190deada172ca1884b11c9a53ec9/?ts=1735574857&meet=${meet}&idAgent=${idAgent}&messageId=${messageId}`
        }
    ],
    MESSAGE: '[B]Cliente tomado[/B] [BR] [S]El cliente ' + nameClient + ' está a la espera de la videollamada (' + insurance + ')[/S] [BR] Selecciona tu estado actual: [send=Disponible]Disponible[/send] | [send=Ocupado]Ocupado[/send]',
  }

  const response = await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.update', data)
  

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

const PORT = process.env.PORT | 3001

server.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});

module.exports = {
  io
}
