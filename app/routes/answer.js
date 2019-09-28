/*
 * @Description: user router
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 11:56:14
 */
const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router();

const { find, findById, create, update, delete: del, checkAnswerExist, checkAnswerer } = require('../controllers/answer');
router.prefix('/questions/:questionId/answers')

const { secret } = require('../config');

// 用户认证中间件
const auth = jwt({ secret });

router.get('/', find);
router.get('/:id', checkAnswerExist, findById);
router.post('/', auth, create);

router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update);
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del);

module.exports = router;