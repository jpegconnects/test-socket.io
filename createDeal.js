const { Router } = require('express');
const axios = require('axios')

const router = Router()

router.post('/create-deal', async (req, res) => {
    
    const { title, category,  } = req.body

    try {
        
        let dealTitle = title.toLowerCase()
    
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

            return res.send({creado: false, existe: true})
        }
    
        await axios.post('https://demo-egconnects.bitrix24.com/rest/221/t9a366b47rs3tas0/crm.deal.add.json', {
                fields: {
                    TITLE: title,
                    CATEGORY_ID: category
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        )
    
        return res.send({creado: true, existe: false})
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
