import express from 'express'
import work from '../controller/work'

const router = express.Router()

router.get('/category', work.category)
    // 发布接口
router.post('/publish', work.publish)
    // 根据不同的cate_id返回相应问题信息
router.get('/works', work.resWorkByState)
    // 查看问题详情接口
router.get('/detail', work.detail)
    // 评论接口
router.post('/answer', work.answer)
    // 修改作品接口
router.post('/modify_works', work.modifyWorks)
    // 修改评论接口
router.post('/modify_answer', work.modifyAnswer)
    // 置顶评论接口
router.get('/adopt', work.adopt)
    // 回复接口
router.post('/reply', work.reply)
    // 查看数量 +1 接口
router.post('/watchnum', work.watchnum)
    // 根据分类获 接口
router.get('/quesbycate', work.getQuesByCate)
    // 搜索获取 接口
router.get('/search', work.search)

export default router