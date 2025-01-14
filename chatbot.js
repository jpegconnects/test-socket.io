const express = require("express")
const axios = require('axios')
const { agentesObj, agregarAgenteDisponible, agenteOcupado } = require('./cola')

const router = express.Router()

router.post('/chatbot', async (req, res) => {

    let data = req.body.data
    const idSender = data.PARAMS.AUTHOR_ID

    try {
        
        if(data.PARAMS.MESSAGE.toLowerCase() === 'disponible' || data.PARAMS.MESSAGE.toLowerCase() === 'consulta finalizada') {
            let agent = agregarAgenteDisponible(data.PARAMS.AUTHOR_ID)
    
            let body = {
                BOT_ID: 231,
                CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                DIALOG_ID: data.PARAMS.AUTHOR_ID,
                MESSAGE: `Tu estado actual es: ${agent.displonible ? 'Disponible' : 'Ocupado'}`,
            }
    
            await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)

            if(agentesObj[idSender].attending.dealId != '') {

                let dealId = agentesObj[idSender].attending.dealId

                let response = await axios.get(`https://demo-egconnects.bitrix24.com/rest/221/t9a366b47rs3tas0/crm.timeline.comment.get.json?id=${agent.attending.timelineId}`)

                let fechaInicio = new Date(response.data.result.CREATED)
                let fechaFin = new Date()

                let options = {timeZone: 'America/Caracas'};
                fechaInicio = fechaInicio.toISOString('en-US', options);
                fechaFin = fechaFin.toISOString('en-US', options);

                fechaInicio = new Date(fechaInicio)
                fechaFin = new Date(fechaFin)

                const calcularDiferenciaMinutos = (fecha1, fecha2) => {
                    // Asegurarse que ambos argumentos sean objetos Date
                    if (!(fecha1 instanceof Date) || !(fecha2 instanceof Date)) {
                    throw new Error("Los argumentos deben ser objetos Date");
                    }
                
                    // Calcular la diferencia en milisegundos
                    const diferenciaMilisegundos = Math.abs(fecha2 - fecha1);
                
                    // Convertir la diferencia a minutos
                    const diferenciaMinutos = Math.ceil(diferenciaMilisegundos / (1000 * 60));
                
                    return diferenciaMinutos;
                }

                const duration = calcularDiferenciaMinutos(fechaInicio, fechaFin)
                
                let message = "Se finalizó la consulta. \nDuración de la videollamada: " + duration + " " + (duration == 1 ? "minuto" : "minutos")

                await axios.post('https://demo-egconnects.bitrix24.com/rest/221/t9a366b47rs3tas0/crm.timeline.comment.add', {
                    fields: {
                        "ENTITY_ID": dealId,
                        "ENTITY_TYPE": "deal",
                        "AUTHOR_ID": idSender,
                        "COMMENT": message,
                    }
                })

                agentesObj[idSender].attending = {
                    clientName: '',
                    dealId: ''
                }
            }
        }
    
        if(data.PARAMS.MESSAGE.toLowerCase() === 'ocupado') {
            let agent = agenteOcupado(data.PARAMS.AUTHOR_ID)
    
            let body = {
                BOT_ID: 231,
                CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                DIALOG_ID: data.PARAMS.AUTHOR_ID,
                MESSAGE: `Tu estado actual es: ${agent.displonible ? 'Disponible' : 'Ocupado'}`,
            }
    
            await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)
    
            console.log(agent, agentesObj)
        }
    
        if(data.PARAMS.MESSAGE.toLowerCase() === 'transferir videollamada') {
    
            let buttons = ''
            let buttonsAllAgents = ''
            let message = ''
    
            for (const key in agentesObj) {
                const agent = agentesObj[key]

                if(agent.id != data.PARAMS.AUTHOR_ID) {

                    buttonsAllAgents += `[send=${agent.name}]${agent.name}[/send] [B]${agent.displonible == false ? 'Ocupado' : 'Disponible'}[/B]\n`
                    
                    if(agent.displonible) {
                        buttons += `[send=${agent.name}]${agent.name}[/send]\n`
                    }
                }
            }

            message = `Agentes disponibles:\n ${buttons}`

            if(buttons == '') {
                message = `No hay agentes disponibles:\n ${buttonsAllAgents}`
            }
    
            let body = {
                BOT_ID: 231,
                CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                DIALOG_ID: data.PARAMS.AUTHOR_ID,
                MESSAGE: message += '\n[send=Mostrar todos los agentes]Mostrar todos los agentes[/send]',
            }
    
            await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)
    
        }

        if(data.PARAMS.MESSAGE.toLowerCase() === 'mostrar todos los agentes') {

            let buttonsAllAgents = ''
            let message = ''
    
            for (const key in agentesObj) {
                const agent = agentesObj[key]

                if(agent.id != data.PARAMS.AUTHOR_ID) {

                    buttonsAllAgents += `[send=${agent.name}]${agent.name}[/send] [B]${agent.displonible == false ? 'Ocupado' : 'Disponible'}[/B]\n`
                }
            }

            message = `Todos los agentes:\n ${buttonsAllAgents}`
    
            let body = {
                BOT_ID: 231,
                CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                DIALOG_ID: data.PARAMS.AUTHOR_ID,
                MESSAGE: message,
            }
    
            await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)
        }
    
        for (const key in agentesObj) {
            const agent = agentesObj[key]


            if(data.PARAMS.MESSAGE === agent.name) {

                const {name: clientName, insurance, clientId, dealId} = agentesObj[idSender].customerWaiting

                agentesObj[agent.id].customerWaiting = {...agentesObj[idSender].customerWaiting}

                // agentesObj[idSender].customerWaiting = {
                //     name: '',
                //     insurance: '',
                //     clientId: '',
                //     dealId: ''
                // }

                let body = {
                    BOT_ID: 231,
                    CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                    DIALOG_ID: agent.id,
                    KEYBOARD: [
                        {
                            "TEXT": "Entrar a la videollamada",
                            "LINK": `https://b24-w21mkt.bitrix24.site/?meet=${agent.meet}&insurance=${insurance}&idAgent=${agent.id}&nameClient=${clientName}&idClient=${clientId}&deal=${dealId}`
                        }
                    ],
                    MESSAGE: 'El cliente ' + clientName + ' está a la espera de la videollamada (' + insurance + ') [BR] [send=Transferir videollamada]Transferir videollamada[/send]',
                }
        
                axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)
                .then(data => {

                    let messageId = data.data.result

                    body.MESSAGE_ID = messageId
                    body.KEYBOARD = [
                        {
                            "TEXT": "Entrar a la videollamada",
                            "LINK": `https://b24-w21mkt.bitrix24.site/?meet=${agent.meet}&insurance=${insurance}&idAgent=${agent.id}&nameClient=${clientName}&idClient=${clientId}&deal=${dealId}&messageId=${messageId}`
                        }
                    ]
        
                    axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.update.json', body)
                    .then(() => {

                        let body = {
                            BOT_ID: 231,
                            CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                            DIALOG_ID: idSender,
                            MESSAGE: `Selecciona tu estado actual: [BR] [send=Disponible]Disponible[/send] | [send=Ocupado]Ocupado[/send]`,
                        }
                
                        axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)
                        .then((data) => {
                            console.log(data.data)
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
    
            }
        }

        return res.json({message: 'Mensaje recibido'})
    } catch (error) {
        console.log(error.response.data)
    }

})

module.exports = router
