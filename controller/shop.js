import BaseComponent from '../prototype/baseComponent'
import ShopModel from '../models/shop'
import config from '../config'

class Goods extends BaseComponent {
    constructor() {
        super()
        this.publish = this.publish.bind(this)
        this.detail = this.detail.bind(this)
        this.resGoodsByState = this.resGoodsByState.bind(this)
    }

    async detail(req, res) {
        try {
            let goods_id = parseInt(req.query.goods_id)

            let ret = await ShopModel.aggregate([{
                $match: {
                    goods_id
                }
            }])
            let result = ret[0]

            return res.json({
                code: 0,
                msg: '获取商品详情成功',
                data: result
            })
        } catch (err) {
            console.log('获取商品详情失败' + err)
            return res.json({
                code: -1,
                msg: '获取商品详情失败'
            })
        }


    }
    async getCart_list(req, res) {
        try {
            let goodsId_list = JSON.parse(req.query.goodsId_list)
            let ret = []
            for (let i = 0; i < goodsId_list.length; i++) {
                let goods_id = parseInt(goodsId_list[i].substring(0, 6));
                let s1 = parseInt(goodsId_list[i].substring(10, 14))
                let goods = {}
                goods.goods_id = goodsId_list[i]
                let goods_msg = await ShopModel.aggregate([{
                    $match: {
                        goods_id
                    }
                }])
                goods.title = goods_msg[0].goods_info.title
                goods_msg[0].sku.tree[0].v.forEach(item => {
                    if (s1 == parseInt(item.id)) {
                        goods.imgUrl = item.imgUrl
                    }
                });
                ret.push(goods)
            }
            return res.json({
                code: 0,
                msg: 'okhhhh',
                data: ret
            })
        } catch (err) {
            console.log('获取失败' + err)
            return res.json({
                code: -1,
                msg: '获取失败'
            })
        }


    }
    async publish(req, res) {
        let token = req.headers.authorization
        let {
            title,
            sell_price,
            market_price,
            stock_quantity,
            sold_out,
            goods_delivery,
            cate_id,
            folder
        } = req.body
        let img_show = await this.getImgUrl(folder, JSON.parse(req.body.img_show))
        let img_detail = await this.getImgUrl(folder, JSON.parse(req.body.img_detail))
        let goods_type = JSON.parse(req.body.goods_type)
        try {
            // 检查 token 是否过期
            if (await this.checkToken(token)) {
                return res.json({
                    code: -1,
                    msg: '登录已过期'
                })
            } else {
                let newGoods = {
                    goods_id: await this.getId('goods_id'),
                    title,
                    create_time: this.getCreateTime(),
                    img_show,
                    img_detail,
                    sell_price: parseFloat(sell_price),
                    market_price: parseFloat(market_price),
                    stock_quantity: parseInt(stock_quantity),
                    sold_out: parseInt(sold_out),
                    goods_type,
                    goods_delivery,
                    cate_id: parseInt(cate_id),
                    folder,
                }
                await ShopModel.create(newGoods)

                return res.json({
                    code: 0,
                    msg: '添加商品成功',
                    data: newGoods
                })
            }

        } catch (err) {
            console.log('添加商品失败' + err)
            return res.json({
                code: -1,
                msg: '添加商品失败'
            })
        }
    }

    async resGoodsByState(req, res) {
        try {
            let page = parseInt(req.query.page)
            let state = parseInt(req.query.state)
            let condition = {}
                // 0 代表 全部商品
            switch (state) {
                // 1 - 热卖
                case 1:
                    condition.cate_id = 1;
                    break;
                    // 2 - 新品
                case 2:
                    condition.cate_id = 2;
                    break;
                    // 3 - 9.9专区
                case 3:
                    condition.cate_id = 3;
                    break;
                    // 4 - 
                case 4:
                    condition.cate_id = 4;
                    break;
                    // 5 - 
                case 5:
                    condition.cate_id = 5;
                    break;
                    // 6 - 
                case 6:
                    condition.cate_id = 6;
                    break;
                    // 7 - 
                case 7:
                    condition.cate_id = 7;
                    break;
                    // 8 - 
                case 8:
                    condition.cate_id = 8;
                    break;
                    // 9 - 
                case 9:
                    condition.cate_id = 9;
                    break;
            }

            let result = await ShopModel.aggregate([{
                    $sort: {
                        'goods_id': -1
                    }
                },
                {
                    $skip: (page - 1) * config.limit
                },
                {
                    $limit: config.limit
                },
                {
                    $match: condition
                },
            ])

            return res.json({
                code: 0,
                msg: 'ok',
                data: result
            })

        } catch (err) {
            console.log('获取商品列表失败' + err);
            return res.json({
                code: -1,
                msg: '获取商品列表失败'
            })
        }
    }

}

export default new Goods