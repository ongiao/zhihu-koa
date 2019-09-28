/*
 * @Description: user controller
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-20 14:05:09
 */
'use strict';

const Comment = require('../model/comment');


class CommentController {
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
    const { rootCommentId } = ctx.request.query;

    ctx.body = await Comment.find({
      rootCommentId,
      content: new RegExp(ctx.request.query.q),
      questionId: ctx.params.questionId,
      answerId: ctx.params.answerId
    })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .populate('commentator replyTo');
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
    const comment = await Comment.findById({ _id: ctx.params.id }).select(selectFields).populate('commentator');
    ctx.body = comment;
  }

  /**
   * 评论是否存在中间件
   * @param {*} ctx 
   * @param {*} next 
   */
  async checkCommentExist(ctx, next) {
    const comment = await Comment.findById({ _id: ctx.params.id }).select('+commentator');;
    if (!comment) {
      ctx.throw(404, '错误：评论不存在');
    }
    if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) {
      ctx.throw(404, '错误：该问题下没有此评论');
    }
    if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) {
      ctx.throw(404, '错误：该答案下没有此评论');
    }
    ctx.state.comment = comment;
    await next();
  }

  /**
   * 修改确认操作人权限（是否为该评论的评论者）
   * @param {*} ctx 
   * @param {*} next 
   */
  async checkCommentator(ctx, next) {
    const { comment } = ctx.state;
    if (comment.commentator.toString() !== ctx.state.user._id) {
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
      rootCommenId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false },
    });
    const comment = await Comment.create({
      ...ctx.request.body,
      commentator: ctx.state.user._id,
      questionId: ctx.params.questionId,
      answerId: ctx.params.answerId
    });
    ctx.body = comment;
  }

  /**
   * 更新评论
   * @param {*} ctx 
   */
  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false },
    });
    const { content } = ctx.request.body;
    const comment = await Comment.updateOne({ _id: ctx.params.id }, { content });
    ctx.body = comment;
  }

  /**
   * 删除评论
   * @param {*} ctx 
   */
  async delete(ctx) {
    await Comment.remove({ _id: ctx.params.id });
    ctx.status = 204;
  } 
}

module.exports = new CommentController();