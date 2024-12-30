const express = require("express")

const router = express.Router()

router.post('/chatbot', async (req, res) => {

    console.log(req.body)

    return res.json({message: 'Mensaje recibido'})
})

module.exports = router
