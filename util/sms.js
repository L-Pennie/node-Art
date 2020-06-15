/**
 * sms.send(手机号) 发送短信验证码
 * sms.verify(手机号,验证码) 校验验证码是否正确
 **/

const Core = require('@alicloud/pop-core');
const _ = require('lodash');

// 阿里云控制台 - 短信服务 - 国内消息
const SignName = "";
const TemplateCode = "";

const accessKeyId = "";
const accessKeySecret = "M";

var client = new Core({
    accessKeyId,
    accessKeySecret,
    endpoint: '',
    apiVersion: '2017-05-25'
});

// 保存手机号和验证码的对应关系
// phone_code_list = {'12222222222':['1024']}
var phone_code_list = {};

exports.send = function(phone) {
    // 生成验证码
    var code = "" + _.random(9) + _.random(9) + _.random(9) + _.random(9);
    return new Promise((resolve, reject) => {
        try {
            client.request('SendSms', {
                RegionId: "cn-hangzhou",
                PhoneNumbers: phone,
                SignName,
                TemplateCode,
                TemplateParam: "{code:" + code + "}"
            }, {
                method: 'POST'
            }).then((result) => {
                if (result.Message && result.Message == "OK" && result.Code && result.Code == "OK") { // 短信发送成功
                    // 保存验证码
                    if (phone_code_list[phone]) {
                        phone_code_list[phone].push(code);
                    } else {
                        phone_code_list[phone] = [code];
                    }
                    // 三分钟后删除验证码
                    setTimeout(() => {
                        _.pull(phone_code_list[phone], code);
                        if (phone_code_list[phone] && phone_code_list[phone].length == 0) {
                            delete phone_code_list[phone];
                        }
                    }, 3 * 60 * 1000)
                    resolve(result)
                } else {
                    reject(result)
                }
            }, (ex) => {
                reject(ex)
            })
        } catch (error) {
            reject(error)
        }
    })
}

exports.verify = function(phone, code) {
    return (phone_code_list[phone].indexOf(code) > -1)
}