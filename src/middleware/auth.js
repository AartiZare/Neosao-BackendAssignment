const jwt = require('jsonwebtoken')

const verify = async function(req, res, next) {
    try {
        const token = req.header('Authorization', 'Bearer Token')
        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }
        let splitToken = token.split(' ')

        let decodeToken = jwt.decode(splitToken[1], 'Secrete-key')
        if (!decodeToken) {
            return res.status(403).send({ status: false, message: `Invalid authentication token in request ` })
        }
        if (Date.now() > (decodeToken.exp) * 1000) {
            return res.status(404).send({ status: false, message: `Session Expired, please login again` })
        }
         let verify =  jwt.verify(splitToken[1], 'Secrete-key')
        if (!verify) {
            return res.status(403).send({ status: false, message: `Invalid authentication token in request` })
        }
        req.userId = decodeToken.userId
        next()
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
module.exports.verify = verify