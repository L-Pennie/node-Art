import user from './user'
import my from './my'
import ask from './ask'
import work from './work'
import shop from './shop'

export default app => {
    app.use('/user', user)
    app.use('/my', my)
    app.use('/ask', ask)
    app.use('/work', work)
    app.use('/shop', shop)
}