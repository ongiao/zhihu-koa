/*
 * @Description: user router
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 11:56:14
 */
const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router();

const { find, findById, update, create, checkTopicExist, getTopicFollowers, getQuestions } = require('../controllers/topic');
router.prefix('/topics')

const { secret } = require('../config');

// 用户认证中间件
const auth = jwt({ secret });

router.get('/', find);
router.post('/', auth, create);
router.get('/:id', checkTopicExist, findById);
router.patch('/:id', auth, checkTopicExist, update);
router.get('/:id/followers', checkTopicExist, getTopicFollowers);
router.get('/:id/questions', checkTopicExist, getQuestions);



module.exports = router;