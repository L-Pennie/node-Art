import UserModel from '../models/user'
import TokenModel from '../models/token'
import BaseComponent from '../prototype/baseComponent'
const sms = require("../util/sms.js")
import user from '../models/user';

class User extends BaseComponent {
    constructor() {
            super()
            this.register = this.register.bind(this)
            this.login = this.login.bind(this)
        }
        // 注册
    async register(req, res) {

        // 得到 post 请求的数据
        let body = req.body

        try {
            // 检测昵称是否存在
            let userForNickname = await UserModel.findOne({
                nickname: body.nickname
            })
            if (userForNickname) {
                return res.json({
                    code: -1,
                    msg: '该昵称已存在'
                })
            }
            // 检测手机号是否存在
            let userForPhone = await UserModel.findOne({
                phone: body.phone
            })
            if (userForPhone) {
                return res.json({
                    code: -1,
                    msg: '该手机号已存在'
                })
            }






            let { cipher, password, phone, nickname } = req.body
            console.log(cipher)
            console.log(password)

            //短信验证
            // try {
            // 校验用户提交的验证码
            var isCodeRight = sms.verify(phone, cipher); // 返回true/false
            console.log("短信验证码" + isCodeRight)
            if (isCodeRight) {
                let user_id = await this.getId('user_id')
                let newUser = {
                    user_id,
                    phone,
                    password,
                    nickname,
                    create_time: this.getCreateTime()
                }

                let token = await this.getTokenAndSave(user_id, newUser)

                await UserModel.create(newUser)

                return res.json({
                    code: 0,
                    msg: "验证成功",
                    token
                })
            } else {
                console.log("错误" + err);
                return res.json({
                    code: -1,
                    msg: '验证失败'
                })
            }
            // } catch (err) {
            //     console.log("错误" + err);
            //     return res.json({
            //         code: -1,
            //         msg: '验证失败，请重新输入密码'
            //     })
            // }
            // 都不存在的话则创建信息插入数据库
            // let user_id = await this.getId('user_id')
            // let newUser = {
            //     user_id,
            //     phone: body.phone,
            //     password: body.password,
            //     nickname: body.nickname,
            //     create_time: this.getCreateTime()
            // }

            // let token = await this.getTokenAndSave(user_id, newUser)

            // await UserModel.create(newUser)

            // return res.json({
            //     code: 0,
            //     msg: '注册成功',
            //     token
            // })

        } catch (err) {
            console.log("错误" + err);
            return res.json({
                code: -1,
                msg: '服务器错误'
            })
        }

    }

    // 登录
    async login(req, res) {
        // 得到 post 请求的数据
        let { phone, login_type } = req.body
        console.log(phone)
        console.log(login_type)

        // 检查 user 表中是否有该手机号的数据
        let userData = await UserModel.findOne({
            phone
        })
        console.log(userData)
        if (!userData) {
            return res.json({
                code: -1,
                msg: '该手机号不存在'
            })
        }
        // console.log("login_type:" + typeof(login_type))
        if (login_type === "true") {
            let { password } = req.body
            if (password !== userData.password) {
                return res.json({
                    code: -1,
                    msg: '密码不正确'
                })
            } else {
                // 得到 token
                // 登录时该用户的 user_id 有可能在 token 表中已经存在了一条信息，这是此返回直接返回该条数据的 token 值，没有生成新的 token
                let token = await this.getTokenAndSave(userData.user_id)
                return res.json({
                    code: 0,
                    msg: '登录成功',
                    token
                })
            }
        } else {
            let { cipher } = req.body
            console.log(cipher)
                //短信验证
            try {
                // 校验用户提交的验证码
                var isCodeRight = sms.verify(phone, cipher); // 返回true/false
                console.log("短信验证码" + isCodeRight)
                if (isCodeRight) {
                    let token = await this.getTokenAndSave(userData.user_id)
                    return res.json({
                        code: 0,
                        msg: "验证成功",
                        token
                    })
                } else {
                    console.log("错误" + err);
                    return res.json({
                        code: -1,
                        msg: '验证失败'
                    })
                }
            } catch (err) {
                console.log("错误" + err);
                return res.json({
                    code: -1,
                    msg: '验证失败，请重新输入密码'
                })
            }
        }
    }


    // 退出登录
    async exit(req, res, next) {
            // 得到 token 参数
            let token = req.query.token

            try {
                // 删除该 token 在 token 表中的信息
                await TokenModel.deleteOne({
                    token
                })
                return res.json({
                    code: 0,
                    msg: '退出登录成功'
                })
            } catch (err) {
                console.log('删除token信息失败');
                return res.json({
                    code: -1,
                    msg: '退出登录失败'
                })
            }
        }
        // 修改密码
    async modifyPassword(req, res) {
        let {
            phone,
            password
        } = req.body

        // 检验是否存在该手机号码
        let user = await UserModel.findOne({
            phone
        })

        try {
            if (user) {

                // 修改密码
                await UserModel.updateOne({
                    phone
                }, {
                    password
                })

                return res.json({
                    code: 0,
                    msg: '修改成功'
                })
            } else {
                return res.json({
                    code: -1,
                    msg: '该手机号码不存在'
                })
            }
        } catch (err) {
            console.log('修改密码失败' + err);
            return res.json({
                code: -1,
                msg: '修改密码失败'
            })
        }
    }

    //发送验证码
    async send(req, res) {
        let phone = req.body.phone
        console.log(phone)
            // 发送验证码
        sms.send(phone).then((result) => {
            console.log("短信发送成功")
            console.log(result)
            return res.json({
                code: 0,
                msg: '发送成功'
            })
        }, (ex) => {
            console.log("短信发送失败")
            console.log(ex)
            return res.json({
                code: -1,
                msg: '发送失败'
            })
        });
    }
}


export default new User