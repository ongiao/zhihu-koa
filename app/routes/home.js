/*
 * @Description: home router
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 11:56:08
 */
const Router = require('koa-router');
const router = new Router();
const { index, upload } = require('../controllers/home');

router.get('/', index);
router.post('/upload', upload);

module.exports = router;
