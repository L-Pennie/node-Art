import mongoose from 'mongoose'

const Schema = mongoose.Schema

const shopSchema = new Schema({
    goods_id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    create_time: {
        type: String,
        required: true
    },
    img_show: {
        type: Array,
        default: []
    },
    img_detail: {
        type: Array,
        default: []
    },
    sell_price: {
        type: Number,
        required: true
    },
    market_price: {
        type: Number,
        required: true
    },
    stock_quantity: {
        type: Number,
        required: true
    },
    sold_out: {
        type: Number,
        required: true
    },
    goods_type: {
        type: Array,
        default: []
    },
    goods_delivery: {
        type: String,
        required: true
    },
    cate_id: {
        type: Number,
        required: true
    },

})


const Shop = mongoose.model('Shop', shopSchema)

export default Shop