import express from 'express'
import shop from '../controller/shop'

const router = express.Router()

router.post('/publish', shop.publish)

router.get('/goodslist', shop.resGoodsByState)

router.get('/detail', shop.detail)

router.get('/cart_list', shop.getCart_list)


export default router