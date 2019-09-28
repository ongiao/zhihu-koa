/*
 * @Description: user router
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 11:56:14
 */
const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router();

const { find, findById, update, create, delete: del, checkQuestionExist, checkQuestioner } = require('../controllers/question');
router.prefix('/questions')

const { secret } = require('../config');

// 用户认证中间件
const auth = jwt({ secret });

router.get('/', find);
router.post('/', auth, create);
router.get('/:id', checkQuestionExist, findById);
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update);
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del);



module.exports = router;