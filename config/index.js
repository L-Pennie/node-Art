export default {
    port: 5000, // 端口号
    host: '', // 开发地址
    public_host: '',
    dbHost: '', // 数据库地址
    secret: '', // token 密钥
    overdue_time: 1000 * 60 * 60 * 24, // token过期时间，24小时（单位/毫秒）
    limit: 20, // 一页的条数
}