import express from 'express'
const sms = require("../util/sms.js")
const router = express.Router()
    //发送验证
router.post('/send', function(req, res, next) {
        let phone = req.query.phone
            // 发送验证码
        sms.send(phone).then((result) => {
            console.log("短信发送成功")
            console.log(result)
        }, (ex) => {
            console.log("短信发送失败")
            console.log(ex)
        });
    })
    //短信验证
router.post('/check', function(req, res, next) {
    try {
        let phone = req.query.phone
        let cipher = req.query.cipher
            // 校验用户提交的验证码
        var isCodeRight = sms.verify(phone, cipher); // 返回true/false
        console.log("短信验证" + isCodeRight)
        return res.json({
            code: 0,
            msg: "验证成功"
        })
    } catch (err) {
        console.log(err);
        return res.json({
            code: -1,
            msg: '验证失败'
        })
    }
})

export default router