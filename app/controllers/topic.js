/*
 * @Description: user controller
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 14:05:09
 */
'use strict';

const Topic = require('../model/topic');
const User = require('../model/user');
const Question = require('../model/question');

class TopicController {
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
    ctx.body = await Topic.find({ name: new RegExp(ctx.request.query.q) })
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
    const topic = await Topic.findById(ctx.params.id).select(selectFields);
    ctx.body = topic;
  }

  /**
   * 话题是否存在中间件
   * @param {*} ctx 
   * @param {*} next 
   */
  async checkTopicExist(ctx, next) {
    const topic = await Topic.findById(ctx.params.id);
    if (!topic) {
      ctx.throw(404, '错误：该话题不存在');
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
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    });

    const topic = await Topic.create(ctx.request.body);
    ctx.body = topic;
  }

  /**
   * @name: 
   * @msg: 
   * @param {type} 
   * @return: 
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    });

    const topic = await Topic.update({ _id: ctx.params.id }, ctx.request.body);
    ctx.body = topic;
  }

  /**
   * 获取某个话题的关注者
   * @param {*} ctx 
   */
  async getTopicFollowers(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id });
    ctx.body = users;
  }

  /**
   * 获取话题下的问题
   * @param {*} ctx 
   */
  async getQuestions(ctx) {
    const questions = await Question.find({ topics: ctx.params.id }).populate('topics');
    ctx.body = questions;
  }
}

module.exports = new TopicController();