const { Router } = require('express');
const axios = require('axios')

const router = Router()

router.post('/login', async (req, res) => {

    const { username } = req.body

    try {

        let dealTitle = username.toLowerCase()

        const responseDeal = await axios.post('https://demo-egconnects.bitrix24.com/rest/221/t9a366b47rs3tas0/crm.deal.list', {
            select: [
                'ID',
                'TITLE',
            ],
            filter: {
                'TITLE': dealTitle
            },
        })

        if(responseDeal.data.result.length) {

            let id = responseDeal.data.result[0].ID

            // const response = await axios.post('https://demo-egconnects.bitrix24.com/rest/221/t9a366b47rs3tas0/crm.timeline.comment.add', {
            //     fields: {
            //         "ENTITY_ID": id,
            //         "ENTITY_TYPE": "deal",
            //         "COMMENT": "Se ha creado una nueva consulta",
            //     }
            // })

            // console.log(response)

            return res.send({existe: true, deal: id})
        }

        return res.send({existe: false})
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
