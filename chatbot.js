const express = require("express")
const axios = require('axios')
const { agentesObj, agregarAgenteDisponible, agenteOcupado } = require('./cola')
// const { io } = require('./index.js')

const router = express.Router()

router.post('/chatbot', async (req, res) => {

    let data = req.body.data
    const idSender = data.PARAMS.AUTHOR_ID

    if(data.PARAMS.MESSAGE === 'Disponible') {
        let agent = agregarAgenteDisponible(data.PARAMS.AUTHOR_ID)

        let body = {
            BOT_ID: 231,
            CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
            DIALOG_ID: data.PARAMS.AUTHOR_ID,
            MESSAGE: `Tu estado actual es ${agent.displonible ? 'Disponible' : 'Ocupado'}`,
        }

        await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)

        console.log(agent, agentesObj)
    }

    if(data.PARAMS.MESSAGE === 'Ocupado') {
        let agent = agenteOcupado(data.PARAMS.AUTHOR_ID)

        let body = {
            BOT_ID: 231,
            CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
            DIALOG_ID: data.PARAMS.AUTHOR_ID,
            MESSAGE: `Tu estado actual es ${agent.displonible ? 'Disponible' : 'Ocupado'}`,
        }

        await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)

        console.log(agent, agentesObj)
    }

    if(data.PARAMS.MESSAGE.includes('|')) {

        let messageArray = data.PARAMS.MESSAGE.split('|')

        if(messageArray[0] === 'Transferir videollamada') {
    
            let buttons = ''
    
            for (const key in agentesObj) {
                const agent = agentesObj[key]

                if(agent.id != data.PARAMS.AUTHOR_ID) {

                    buttons += `[send=${agent.name}|${messageArray[1]}]${agent.name}[/send] | `
                }
            }
    
            let body = {
                BOT_ID: 231,
                CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                DIALOG_ID: data.PARAMS.AUTHOR_ID,
                MESSAGE: `Transferir a ${buttons}`,
            }
    
            await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)
    
        }

        for (const key in agentesObj) {
            const agent = agentesObj[key]
    
            if(messageArray[0] === agent.name) {
                console.log(agent.name)
                let body = {
                    BOT_ID: 231,
                    CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                    DIALOG_ID: agent.id,
                    KEYBOARD: [
                        {
                            "TEXT": "Entrar a la videollamada",
                            "LINK": `https://b24-demo.bitrix24.site/preview/0c30190deada172ca1884b11c9a53ec9/?ts=1735574857&meet=${agent.meet}&insurance={insurance}&idAgent=${agent.id}&nameClient={nameClient}&idClient=${messageArray[1]}`
                        }
                    ],
                    MESSAGE: 'Un cliente está a la espera de la videollamada [BR] [send=Transferir videollamada|' + messageArray[1] + ']Transferir videollamada[/send]',
                }
        
                axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', body)
                .then(data => {

                    let messageId = data.data.result

                    console.log(messageId)

                    body.MESSAGE_ID = messageId
                    body.KEYBOARD = [
                        {
                            "TEXT": "Entrar a la videollamada",
                            "LINK": `https://b24-demo.bitrix24.site/preview/0c30190deada172ca1884b11c9a53ec9/?ts=1735574857&meet=${agent.meet}&insurance={insurance}&idAgent=${agent.id}&nameClient={nameClient}&idClient=${messageArray[1]}&messageId=${messageId}`
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
    }




    return res.json({message: 'Mensaje recibido'})
})

module.exports = router
