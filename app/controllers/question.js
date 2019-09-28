/*
 * @Description: user controller
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 14:05:09
 */
'use strict';

const Question = require('../model/question');
const Topic = require('../model/topic');
const User = require('../model/user');

class QuestionController {
  /**
   * @name: 
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async find(ctx) {
    let { perPage = 10, page = 1 } = ctx.query;
    perPage = Math.max(Number(perPage), 1);
    page = Math.max(Number(page), 1); 
    const q = new RegExp(ctx.request.query.q);
    ctx.body = await Question.find({ $or: [{ title: q }, { description: q }] })
      .limit(perPage)
      .skip((page - 1) * perPage);
  }

  /**
   * @name: 
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async findById(ctx) {
    const { fields = '' } = ctx.query;
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
    const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics');
    ctx.body = question;
  }

  /**
   * 问题是否存在中间件
   * @param {*} ctx 
   * @param {*} next 
   */
  async checkQuestionExist(ctx, next) {
    const question = await Question.findById(ctx.params.id).select('+questioner');
    if (!question) {
      ctx.throw(404, '错误：问题不存在');
    }
    ctx.state.question = question;
    await next();
  }

  async checkQuestioner(ctx, next) {
    const { question } = ctx.state;
    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, '错我：用户没有权限');
    }
    await next();
  }

  /**
   * @name: 
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async create(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
    });

    const question = await Question.create({ ...ctx.request.body, questioner: ctx.state.user._id });
    ctx.body = question;
  }

  /**
   * @name: 
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async update(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
    });

    const question = await Question.updateOne({ _id: ctx.params.id }, ctx.request.body);
    ctx.body = question;
  }

  /**
   * 删除问题
   * @param {*} ctx 
   */
  async delete(ctx) {
    await Question.remove({ _id: ctx.params.id });
    ctx.status = 204;
  } 

  /**
   * 获取某个话题的关注者
   * @param {*} ctx 
   */
  async getTopicFollowers(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id });
    ctx.body = users;
  }
}

module.exports = new QuestionController();