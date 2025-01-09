const express = require("express")
const axios = require('axios')
const {queue, agentesObj} = require('./cola')

const router = express.Router()

router.post('/sendMessage', async (req, res) => {

    const {nameClient, insurance, idClient, deal} = req.body

    console.log(nameClient)

    if(nameClient != '') {
        try {

            const reponseAgentAvailable = queue()

            let data = {
                BOT_ID: 231,
                CLIENT_ID: 'gdqcp71f6tiq1wz8582lx7h3g66kmbe6',
                DIALOG_ID: reponseAgentAvailable.id,
                KEYBOARD: [
                    {
                        "TEXT": "Entrar a la videollamada",
                        "LINK": `https://b24-w21mkt.bitrix24.site/?meet=${reponseAgentAvailable.meet}&insurance=${insurance}&idAgent=${reponseAgentAvailable.id}&nameClient=${nameClient}&idClient=${idClient}&deal=${deal}`
                    }
                ],
                MESSAGE: 'El cliente ' + nameClient + ' está a la espera de la videollamada (' + insurance + ') [BR] [send=Transferir videollamada]Transferir videollamada[/send]',
            }

            agentesObj[reponseAgentAvailable.id].customerWaiting = {
                name: nameClient,
                insurance: insurance,
                clientId: idClient,
                dealId: deal
            }

            if(reponseAgentAvailable.agentesDisponibles == false) {
    
                const response = await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add.json', data)
    
                data.MESSAGE_ID = response.data.result
                data.KEYBOARD = [
                    {
                        "TEXT": "Entrar a la videollamada",
                        "LINK": `https://b24-w21mkt.bitrix24.site/?meet=${reponseAgentAvailable.meet}&insurance=${insurance}&idAgent=${reponseAgentAvailable.id}&nameClient=${nameClient}&idClient=${idClient}&deal=${deal}&messageId=${response.data.result}`
                    }
                ]
    
                await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.update.json', data)

                return res.json({message: 'mensaje enviado'})
            }

            const response = await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.add', data)

            console.log(response.data.result)

            data.MESSAGE_ID = response.data.result
            data.KEYBOARD = [
                {
                    "TEXT": "Entrar a la videollamada",
                    "LINK": `https://b24-w21mkt.bitrix24.site/?meet=${reponseAgentAvailable.meet}&insurance=${insurance}&idAgent=${reponseAgentAvailable.id}&nameClient=${nameClient}&idClient=${idClient}&deal=${deal}&messageId=${response.data.result}`
                }
            ]

            await axios.post('https://demo-egconnects.bitrix24.com/rest/221/vakzwrm21roibyj7/imbot.message.update', data)

            return res.json({message: 'mensaje enviado'})
            
        } catch (error) {
            console.log(error)
        }
    }

    return res.json({message: nameClient})
})

module.exports = router
