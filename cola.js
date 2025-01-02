const agentesObj = {
    '7': {
        id: '7',
        name: 'Martha Pineda',
        displonible: true,
        videoconferencia: 'https://demo-egconnects.bitrix24.com/video/M9DIFNym',
        meet: 'M9DIFNym'
    },
    '221': {
        id: '221',
        name: 'Jesuan Patermina',
        displonible: true,
        videoconferencia: 'https://demo-egconnects.bitrix24.com/video/4aKyLmAM',
        meet: '4aKyLmAM'
    },
    '5': {
        id: '5',
        name: 'Daniela Romero',
        displonible: true,
        videoconferencia: 'https://demo-egconnects.bitrix24.com/video/gb4THztp',
        meet: 'gb4THztp'
    },
}

const agentesArray = []

for (const key in agentesObj) {
    const agent = agentesObj[key]
    agentesArray.push(agent.id)
}

console.log(agentesArray)

// Esta función tranfiere la videollamada de un agente a otro
const videollamadaTransferida = (id, idAgentTransfer) => {
    if(id != '' && idAgentTransfer != ''){
        let nameTransfer = agentesObj[idAgentTransfer].name
        return `Cliente transferido al agente ${nameTransfer}`
    }
    else if (id == '' || typeof id === 'undefined') {
        return 'Agente que transfiere no encontrado'
    }
    else if (idAgentTransfer == '' || typeof idAgentTransfer === 'undefined') {
        return 'El agente al que se le va a transferir no fue encontrado'
    }
}

// Esta función se ejecuta cuando un cliente desde el chat, toma una video llamada, y pone al agente automaticamente en "Ocupado"
const agenteTomoVideollamada = (id) => {
    if (id != '' && agentesObj[id]) {
        agentesObj[id].displonible = false
        let name = agentesObj[id].name
        return `Videollamada tomada por el agente ${name}`
    }
    else {
        return 'El agente no existe'
    }
}

// Esta función pone al agente en estado "Ocupado"
const agenteOcupado = (id) => {
    if (id != '' && agentesObj[id]) {
        agentesObj[id].displonible = false
        let name = agentesObj[id].name
        return agentesObj[id]
    }
    else {
        return 'El agente no existe'
    }
}

// esta función pone en estado "Disponible" a un agente
const agregarAgenteDisponible = (id) => {
    if (id != '' && agentesObj[id]) {
        agentesObj[id].displonible = true
        let name = agentesObj[id].name
        return agentesObj[id]
    }
    else {
        return 'El agente no existe'
    }
}

const resetAgents = () => {
    for (const key in agentesObj) {
        const agent = agentesObj[key]
        agent.displonible = true
    }
}

// Esta función busca a un agente que esté disponible para asignarle una videollamada
const anidada = () => {

    let cola = 0

    return () => {
        let buscandoAgente = true
        let agentesOcupados = 0

        while (buscandoAgente) {
            if(cola >= agentesArray.length-1) {
                cola = 0
            }
            else {
                cola++
            }
            console.log(cola)
            
            if(agentesObj[agentesArray[cola]].displonible === true) {
                buscandoAgente = false
                agentesObj[agentesArray[cola]].displonible = false
                let name = agentesObj[agentesArray[cola]].name
                return agentesObj[agentesArray[cola]]
                // return `El agente ${name} fue asignado a un cliente`
            }
            else{
                agentesOcupados++
            }

            if(agentesOcupados >= agentesArray.length) {
                if(cola >= agentesArray.length-1) cola = 0
                else cola++
                
                buscandoAgente = false
                let info = {
                    agent: agentesObj[agentesArray[cola]],
                    agentesDisponibles: false,
                    id: agentesObj[agentesArray[cola]].id,
                    meet: agentesObj[agentesArray[cola]].meet
                }


                return info
            }

        }

    }
}

const queue = anidada()

module.exports = {
    agentesObj,
    queue,
    agregarAgenteDisponible,
    agenteOcupado,
    agenteTomoVideollamada,
    videollamadaTransferida,
    resetAgents
}
