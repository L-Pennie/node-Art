import BaseComponent from '../prototype/baseComponent'
import CategoryModel from '../models/category'
import WorkModel from '../models/work'
import AnswerModel from '../models/answer'
import UserModel from '../models/user'
import config from '../config'

class Work extends BaseComponent {
    constructor() {
        super()
        this.category = this.category.bind(this)
        this.publish = this.publish.bind(this)
        this.resWorkByState = this.resWorkByState.bind(this)
        this.detail = this.detail.bind(this)
        this.answer = this.answer.bind(this)
        this.reply = this.reply.bind(this)
        this.getQuesByCate = this.getQuesByCate.bind(this)
        this.modifyWorks = this.modifyWorks.bind(this)
    }
    async category(req, res) {
        try {
            let data = await CategoryModel.find()

            return res.json({
                code: 0,
                msg: '获取作品分类成功',
                data
            })

        } catch (err) {

            console.log('获取作品分类失败' + err);
            return res.json({
                code: -1,
                msg: '获取作品分类失败'
            })
        }

    }

    async resWorkByState(req, res) {
        try {
            let page = parseInt(req.query.page)
            let state = parseInt(req.query.state)
            let condition = {}
                // 0 代表 全部作品
            switch (state) {
                // 1 - 彩铅
                case 1:
                    condition.cate_id = 1;
                    break;
                    // 2 - 水粉
                case 2:
                    condition.cate_id = 2;
                    break;
                    // 3 - 素描
                case 3:
                    condition.cate_id = 3;
                    break;
                    // 4 - 水墨
                case 4:
                    condition.cate_id = 4;
                    break;
                    // 5 - 水彩
                case 5:
                    condition.cate_id = 5;
                    break;
                    // 6 - 油画
                case 6:
                    condition.cate_id = 6;
                    break;
                    // 7 - 国画
                case 7:
                    condition.cate_id = 7;
                    break;
                    // 8 - 钢笔画
                case 8:
                    condition.cate_id = 8;
                    break;
                    // 9 - 其他
                case 9:
                    condition.cate_id = 9;
                    break;
            }

            let result = await WorkModel.aggregate([{
                    $sort: {
                        'work_id': -1
                    }
                },
                {
                    $match: condition
                },
                {
                    $skip: (page - 1) * config.limit
                },
                {
                    $limit: config.limit
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'from'
                    },
                }
            ])
            result.forEach(item => {
                item.from = item.from[0]
                item.create_time = item.create_time.substring(5, 10)
            })

            return res.json({
                code: 0,
                msg: 'ok',
                data: result
            })

        } catch (err) {
            console.log('获取作品列表失败' + err);
            return res.json({
                code: -1,
                msg: '获取作品列表失败'
            })
        }
    }
    async detail(req, res) {
        try {
            let work_id = parseInt(req.query.work_id)

            let ret = await WorkModel.aggregate([{
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'from'
                    }
                },

                {
                    $match: {
                        work_id
                    }
                }
            ])

            let answer = await AnswerModel.aggregate([{
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'from'
                    }
                },
                {
                    $match: {
                        work_id
                    }
                }
            ])

            let result = ret[0]
            if (result.img_arr != null) {
                result.img_arr = result.img_arr.map(item => {
                    let obj = {}
                    obj.url = item
                    return obj
                })
            }
            result.answer = answer
            result.from = result.from[0]

            // 获取当前 token 所对应的 user_id 返回前台进行判断
            let token = req.headers.authorization
            let nowUserId = await this.findIdByToken(token)

            result.nowUserId = nowUserId

            return res.json({
                code: 0,
                msg: '获取作品详情成功',
                data: result
            })
        } catch (err) {
            console.log('获取作品详情失败' + err)
            return res.json({
                code: -1,
                msg: '获取作品详情失败'
            })
        }


    }
    async answer(req, res) {
        try {
            let {
                work_id,
                content
            } = req.body
            let token = req.headers.authorization

            let newAnswer = {
                    work_id,
                    answer_id: await this.getId('answer_id'),
                    user_id: await this.findIdByToken(token),
                    content,
                    answer_time: this.getCreateTime()
                }
                // 将该评论信息插入评论表
            await AnswerModel.create(newAnswer)

            // 同时将该作品下的评论数 +1
            let item = await WorkModel.findOne({
                work_id
            })
            let nowAnswerNum = parseInt(item.answer_num)
            await WorkModel.updateOne({
                work_id
            }, {
                answer_num: nowAnswerNum + 1
            })

            // 查询该评论者信息
            let ret = await UserModel.findOne({
                user_id: newAnswer.user_id
            })

            let result = Object.assign({}, ret, newAnswer)

            return res.json({
                code: 0,
                msg: '评论作品成功',
                data: result
            })
        } catch (err) {
            console.log('评论作品失败' + err)
            return res.json({
                code: -1,
                msg: '评论作品失败'
            })
        }


    }

    async modifyAnswer(req, res) {
        try {
            let {
                answer_id,
                content
            } = req.body

            await AnswerModel.updateOne({
                answer_id
            }, {
                content
            })

            return res.json({
                code: 0,
                msg: '修改评论成功'
            })

        } catch (err) {
            console.log('修改评论失败' + err)
            return res.json({
                code: -1,
                msg: '修改评论失败'
            })
        }

    }
    async adopt(req, res) {
        try {
            let {
                answer_id,
                work_id
            } = req.query

            // 更改评论状态为推荐评论
            await AnswerModel.updateOne({
                    answer_id
                }, {
                    state: 1
                })
                // 更改作品状态为已解决状态
            await WorkModel.updateOne({
                work_id
            }, {
                state: 1
            })

            return res.json({
                code: 0,
                msg: '置顶成功'
            })

        } catch (err) {
            console.log('置顶评论失败' + err)
            return res.json({
                code: -1,
                msg: '置顶评论失败'
            })
        }
    }
    async reply(req, res) {
        try {
            let token = req.headers.authorization
            let {
                answer_id,
                reply_content
            } = req.body

            let user_id = await this.findIdByToken(token)
            let ret = await UserModel.findOne({
                user_id
            })

            await AnswerModel.updateOne({
                answer_id
            }, {
                '$push': {
                    replys: {
                        user_id,
                        reply_content,
                        reply_time: this.getCreateTime(),
                        avatar: ret.avatar,
                        nickname: ret.nickname
                    }
                }
            })

            return res.json({
                code: 0,
                msg: '回复成功'
            })

        } catch (err) {
            console.log('回复失败' + err);
            return res.json({
                code: -1,
                msg: '回复失败'
            })
        }



    }
    async watchnum(req, res) {
        let {
            work_id
        } = req.body

        let item = await WorkModel.findOne({
            work_id
        })

        let nowWatchNum = item.watch_num

        await WorkModel.updateOne({
            work_id
        }, {
            watch_num: nowWatchNum + 1
        })
        return res.json()
    }
    async getQuesByCate(req, res) {
        try {
            let { cate_id, state, page } = req.query
                // 由于接受的是字符串需要转换为数字
            cate_id = parseInt(cate_id)
            state = parseInt(state)
                // 关联查询
            let list = await WorkModel.aggregate([{
                        $match: {
                            cate_id,
                            state
                        }
                    },
                    {
                        $skip: config.limit * (page - 1)
                    },
                    {
                        $limit: config.limit
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user_id',
                            foreignField: 'user_id',
                            as: 'from'
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'cate_id',
                            foreignField: 'cate_id',
                            as: 'cate'
                        }
                    }
                ])
                // 过滤 list 格式, 仅当 list 有 length 的时候过滤
            if (list.length) {
                list.forEach(item => {
                    item.from = item.from[0]
                    item.cate = item.cate[0]
                })
            }
            // 计算总页数
            let infor = await WorkModel.find({
                cate_id,
                state
            })
            let cal = infor.length / config.limit
            let totalPage = infor.length % config.limit === 0 ? cal : Math.floor(cal) + 1
                // 根据 cate_id 获取 cate_name
            let cate = await CategoryModel.findOne({ cate_id })

            return res.json({
                code: 0,
                msg: '获取作品成功',
                data: {
                    list,
                    totalPage,
                    title: cate.title
                }
            })

        } catch (err) {
            console.log('获取作品列表失败' + err);
            return res.json({
                code: -1,
                msg: '获取作品列表失败'
            })
        }

    }
    async publish(req, res) {
        let token = req.headers.authorization
        let {
            cate_id,
            title,
            folder,
            description
        } = req.body
        let img_arr = await this.getImgUrl(folder, JSON.parse(req.body.img_arr))
        description = JSON.parse(description)
        try {
            // 检查 token 是否过期
            if (await this.checkToken(token)) {
                return res.json({
                    code: -1,
                    msg: '登录已过期'
                })
            } else {
                let newWork = {
                    img_arr,
                    work_id: await this.getId('work_id'),
                    cate_id: parseInt(cate_id),
                    user_id: await this.findIdByToken(token),
                    title,
                    description,
                    create_time: this.getCreateTime()
                }
                await WorkModel.create(newWork)

                return res.json({
                    code: 0,
                    msg: '发表成功',
                    data: newWork
                })
            }

        } catch (err) {
            console.log('发表作品失败' + err)
            return res.json({
                code: -1,
                msg: '发表作品失败'
            })
        }
    }
    async modifyWorks(req, res) {
        try {
            let {
                work_id,
                title,
                description,
                folder,
                img_arr
            } = req.body
            if (img_arr != null) {
                img_arr = JSON.parse(img_arr)
            } else {
                img_arr = null
            }
            img_arr = await this.getImgUrl(folder, img_arr)
            let ret = await WorkModel.updateOne({
                work_id
            }, {
                title,
                description,
                img_arr
            })

            return res.json({
                code: 0,
                msg: '修改作品成功',
                data: ret
            })

        } catch (err) {
            return res.json({
                code: -1,
                msg: '修改作品失败'
            })
        }
    }
    async search(req, res) {
        try {
            let searchList = []
            var title = req.query.title
            var condition = {}
            condition.state = 0
            let workList = await WorkModel.aggregate([{
                        $sort: {
                            work_id: -1
                        }
                    },
                    {
                        $match: condition
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user_id',
                            foreignField: 'user_id',
                            as: 'from'
                        }
                    }
                ])
                //过滤 quesList 格式--------from接收的数组转为对象
            if (workList.length) {
                workList.forEach(item => {
                    item.from = item.from[0]
                })
            }

            //去掉title左右两边的双引号
            var title1 = title.replace("\"", "").replace("\"", "");
            //过滤获得含有搜索关键字的数据
            if (workList.length) {
                workList.forEach(item => {
                    if (item.title.indexOf(title1) > -1)
                        searchList.push(item)
                })
            }
            return res.json({
                code: 0,
                msg: '获取search数据成功',
                data: {
                    workList,
                    searchList
                }
            })


        } catch (err) {
            console.log('获取首页数据失败' + err);
            return res.json({
                code: -1,
                msg: '获取search数据失败'
            })
        }
    }
}

export default new Work