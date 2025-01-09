require('dotenv').config()
const express = require('express');
const axios = require('axios')
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors')
const chatbot = require('./chatbot.js')


// Routes
const { queue, agregarAgenteDisponible, agenteTomoVideollamada, agenteOcupado, resetAgents, agentesObj } = require('./cola')
const routerSendMessage = require('./sendMessage.js')
const routerCreateDeal = require('./createDeal.js')
const routerLogin = require('./login.js')

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

  const {meet, idAgent, messageId, nameClient, insurance, idClient, deal} = req.body

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
          "LINK": `https://b24-w21mkt.bitrix24.site/?meet=${meet}&idAgent=${idAgent}&messageId=${messageId}`
        }
    ],
    MESSAGE: '[B]Cliente tomado[/B] [BR] [S]El cliente ' + nameClient + ' está a la espera de la videollamada (' + insurance + ')[/S] [BR] [send=Consulta finalizada]Consulta finalizada[/send]',
  }

  try {

    console.log(deal)

    await axios.post('https://demo-egconnects.bitrix24.com/rest/221/t9a366b47rs3tas0/crm.timeline.comment.add', {
        fields: {
            "ENTITY_ID": deal,
            "ENTITY_TYPE": "deal",
            "AUTHOR_ID": idAgent,
            "COMMENT": "Se ha creado una nueva consulta",
        }
    })

    await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.update', data)

    agentesObj[idAgent].attending = {
      clientName: nameClient,
      dealId: deal
    }

    agentesObj[idAgent].customerWaiting = {
      name: '',
      insurance: '',
      clientId: '',
      dealId: ''
  }

  } catch (error) {
    console.log(error)
    console.log(deal)
  }



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

app.get('/reset-agents', (req, res) => {
  
  resetAgents()

  res.send(agentesObj)
})

app.get('/get-agents', (req, res) => {
  res.send(agentesObj)
})

app.use('/', chatbot)
app.use('/', routerSendMessage)
app.use('/', routerCreateDeal)
app.use('/', routerLogin)

const PORT = process.env.PORT | 8080

server.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});

module.exports = {
  io
}
