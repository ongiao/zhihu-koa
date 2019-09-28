/*
 * @Description: user router
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 11:56:14
 */
const Router = require('koa-router');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const router = new Router();

const { find, findById, create, update, delete: del,
    login, checkOwner, getUserFollowing, follow, unfollow,
    getUserFollowers, checkUserExist, followTopic, unfollowTopic,
    getUserFollowingTopics, getUserQuestions,
    getLikingAnswers, likeAnswer, unlikeAnswer,
    getDisLikingAnswers, dislikeAnswer, undislikeAnswer,
    getCollectingAnswers, collectAnswer, unCollectAnswer } = require('../controllers/user');
const { checkTopicExist } = require('../controllers/topic');
const { checkAnswerExist } = require('../controllers/answer');

router.prefix('/users')

const { secret } = require('../config');

// 用户认证中间件
const auth = jwt({ secret });

router.get('/', find);
router.get('/:id', findById);
router.post('/', create);
router.patch('/:id', auth, checkOwner, update);
router.delete('/:id', auth, checkOwner, del);
router.post('/login', login);
router.get('/:id/following', getUserFollowing);
router.put('/following/:id', auth, checkUserExist, follow);
router.delete('/following/:id', auth, checkUserExist, unfollow);
router.get('/:id/followers', checkUserExist, getUserFollowers);
router.get('/:id/followingTopics', checkUserExist, getUserFollowingTopics);
router.put('/followingTopic/:id', auth, checkTopicExist, followTopic);
router.delete('/followingTopic/:id', auth, checkTopicExist, unfollowTopic);
router.get('/:id/questions', getUserQuestions);
// 赞答案
router.get('/:id/likinganswers', checkUserExist, getLikingAnswers);
router.put('/likinganswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer);
router.delete('/likinganswers/:id', auth, checkAnswerExist, unlikeAnswer);
// 踩答案
router.get('/:id/dislikinganswers', checkUserExist, getDisLikingAnswers);
router.put('/dislikinganswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer);
router.delete('/dislikinganswers/:id', auth, checkAnswerExist, undislikeAnswer);
// 收藏or取消收藏答案
router.get('/:id/collectingAnswers', checkUserExist, getCollectingAnswers);
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer);
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, unCollectAnswer);

module.exports = router;