/*
 * @Description: user controller
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 14:05:09
 */
'use strict';

const User = require('../model/user');
const Answer = require('../model/answer');
const Question = require('../model/question');
const jsonwebtoken = require('jsonwebtoken');
const { secret } = require('../config');

class UserController {
  /**
   * @name: 获取用户列表
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async find(ctx) {
    let { perPage = 10, page = 1 } = ctx.query;
    perPage = Math.max(Number(perPage), 1);
    page = Math.max(Number(page), 1); 
    ctx.body = await User.find({ name: new RegExp(ctx.request.query.q) })
      .limit(perPage)
      .skip((page - 1) * perPage);
  }

  /**
   * @name: 通过用户id得到用户信息
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async findById(ctx) {
    const { fields = '' } = ctx.query;
    const seelctFileds = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
    const populateFields = fields.split(';').filter(f => f).map(f => {
      if (f === 'employments') {
        return 'employments.company employments.job';
      }
      if (f === 'educations') {
        return 'educations.school educations.major';
      }
      return f;
    }).join(' ');
    const user = await User.findById(ctx.params.id)
      .select(seelctFileds)
      .populate(populateFields);
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.body = user;
  }

  /**
   * @name: 创建新用户
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    });

    const { name } = ctx.request.body;
    const repeatedUser = await User.findOne({ name });
    if (repeatedUser) {
      ctx.throw(409, '错误：用户名已经存在');
    }

    const user = await User.create(ctx.request.body);
    ctx.body = user;
  }

  /**
   * @name: 判断权限
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '错误：没有权限');
    }
    await next();
  }

  /**
   * @name: 更新用户个人信息
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false, default: '' },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
    });

    const { name } = ctx.request.body;
    const repeatedUser = await User.findOne({ name });
    if (repeatedUser) {
      ctx.throw(409, '错误：用户名已经存在');
    }

    const user = await User.updateOne({ _id: ctx.params.id }, ctx.request.body);
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.body = user;
  }

  /**
   * @name: 删除用户
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async delete(ctx) {
    const user = await User.remove({ _id: ctx.params.id });
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.status = 204;
  } 

  /**
   * @name: 用户登录
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async login(ctx) { 
    ctx.verifyParams({
      name    : { type: 'string', required: true },
      password: { type: 'string', required: true },
    });

    const user = await User.findOne(ctx.request.body);
    if (!user) {
      ctx.throw(401, '错误：用户名或密码不正确');
    }

    const { name, _id } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' });

    ctx.body = { token };
  }

  /**
   * 
   * @param {*} ctx 
   */
  async getUserFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following');
    if (!user) { 
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.body = user.following;
  }

  /**
   * 获取某个用户的粉丝
   * @param {*} ctx 
   */
  async getUserFollowers(ctx) {
    const users = await User.find({ following: ctx.params.id });
    ctx.body = users;
  }

  /**
   * 用户是否存在中间件
   * @param {*} ctx 
   * @param {*} next 
   */
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    await next();
  }

  /**
   * 关注某个用户
   * @param {*} ctx 
   */
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following');
    if (me.following.map(id => id.toString()).indexOf(ctx.params.id) < 0) {
      me.following.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
  }

  /**
   * 取消关注某个用户
   * @param {*} ctx 
   */
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following');
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }

  /**
   * 获取用户关注的话题列表
   * @param {*} ctx 
   */
  async getUserFollowingTopics(ctx) {
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.body = user.followingTopics;
  }

  /**
   * @name: 关注某个话题
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics');
    if (me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id) < 0) {
      me.followingTopics.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
  }

  /**
   * 取消关注某个话题
   * @param {*} ctx 
   */
  async unfollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics');
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }

  /**
   * 获取用户提问
   * @param {*} ctx 
   */
  async getUserQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id });
    ctx.body = questions;
  }

  /**
   * 获取用户喜欢的答案
   * @param {*} ctx 
   */
  async getLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers');
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.body = user.likingAnswers;
  }

  /**
   * @name: 喜欢某个答案
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async likeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
    if (me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id) < 0) {
      me.likingAnswers.push(ctx.params.id);
      me.save();
      await Answer.updateOne({ _id: ctx.params.id }, { $inc: { voteCount: 1 } });
    }
    ctx.status = 204;
    await next();
  }

  /**
   * 取消关注某个话题
   * @param {*} ctx 
   */
  async unlikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
    const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.likingAnswers.splice(index, 1);
      me.save();
      await Answer.updateOne({ _id: ctx.params.id }, { $inc: { voteCount: -1 } });
    }
    ctx.status = 204;
  }

  /**
  * 获取用户不喜欢的答案
  * @param {*} ctx 
  */
  async getDisLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.body = user.dislikingAnswers;
  }

  /**
   * @name: 踩某个答案
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async dislikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
    if (me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id) < 0) {
      me.dislikingAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }

  /**
   * 取消踩某个答案
   * @param {*} ctx 
   */
  async undislikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
    const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }

  /**
   * @name: 获取收藏的答案
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async getCollectingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers');
    if (!user) {
      ctx.throw(404, '错误：用户不存在');
    }
    ctx.body = user.collectingAnswers;
  }

  /**
   * @name: 收藏答案
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async collectAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
    if (me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id) < 0) {
      me.collectingAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }

  /**
   * 取消收藏答案
   * @param {*} ctx 
   */
  async unCollectAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
    const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.collectingAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
}

module.exports = new UserController();