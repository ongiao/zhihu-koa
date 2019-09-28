/*
 * @Description: user controller
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 14:05:09
 */
'use strict';

const Answer = require('../model/answer');
const Question = require('../model/question');


class AnswerController {
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
    ctx.body = await Answer.find({ content: q, questionId: ctx.params.questionId })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .populate('answerer questioner');
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
    const answer = await Answer.findById({ _id: ctx.params.id }).select(selectFields).populate('answerer');
    ctx.body = answer;
  }

  /**
   * 问题是否存在中间件
   * @param {*} ctx 
   * @param {*} next 
   */
  async checkAnswerExist(ctx, next) {
    const answer = await Answer.findById({ _id: ctx.params.id });
    if (!answer) {
      ctx.throw(404, '错误：答案不存在');
    }
    // 只有在删改查答案的时候才检查此逻辑，赞和踩不检查
    if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
      ctx.throw(404, '错误：该问题下没有此答案');
    }
    ctx.state.answer = answer;
    await next();
  }

  /**
   * 修改确认操作人权限（是否为该回答的回答者）
   * @param {*} ctx 
   * @param {*} next 
   */
  async checkAnswerer(ctx, next) {
    const { answer } = ctx.state;
    if (answer.answerer.toString() !== ctx.state.user._id) {
      ctx.throw(403, '错误：用户没有权限');
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
      content: { type: 'string', required: true },
    });
    const question = await Answer.create({
      ...ctx.request.body,
      answerer  : ctx.state.user._id,
      questionId: ctx.params.id
    });
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
      content: { type: 'string', required: false },
    });

    const answer = await Answer.updateOne({ _id: ctx.params.id }, ctx.request.body);
    ctx.body = answer;
  }

  /**
   * 删除问题
   * @param {*} ctx 
   */
  async delete(ctx) {
    await Answer.remove({ _id: ctx.params.id });
    ctx.status = 204;
  } 
}

module.exports = new AnswerController();