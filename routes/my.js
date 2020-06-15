import express from 'express'
import my from '../controller/my'

const router = express.Router()

// 首页
router.get('/index', my.index)
    // 获取个人资料
router.get('/information', my.getInformation)
    // 修改个人资料
router.post('/information', my.modifyInformation)
    // 获取我的问题
router.get('/question', my.getQuestion)
    // 删除问题
router.get('/delete_question', my.deleteQues)
    // 获取我的发布
router.get('/work', my.getWork)
    // 删除发布
router.get('/delete_work', my.deleteWork)

export default router