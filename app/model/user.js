/*
 * @Description: 
 * @version: 
 * @Author: Junxing
 * @Date: 2019-09-21 00:18:40
 */
const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const userSchema = new Schema({
  __v     : { type: Number, select: false },
  name    : { type: String, required: true, comment: '用户名' },
  password: { type: String, required: true, select: false, comment: '用户密码，默认不显示' },
  avatar_url: { type: String, required: false, default: '' },
  gender: { type: String, enum: [ 'male', 'female' ], required: true, default: 'male' },
  headline: { type: String, required: false, default: '' },
  locations: { type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }], required: false, default: [], select: false },
  business: { type: Schema.Types.ObjectId, ref: 'Topic', select: false },
  employments: {
    type: [{
      company: { type: Schema.Types.ObjectId, ref: 'Topic' },
      job: { type: Schema.Types.ObjectId, ref: 'Topic' },
    }],
    select: false,
  },
  educations: {
    type: [{
      school: { type: Schema.Types.ObjectId, ref: 'Topic' },
      major: { type: Schema.Types.ObjectId, ref: 'Topic' },
      diploma: { type: Number },
      entrance_year: { type: Number }, 
      graduation_year: { type: Number },
    }],
    select: false,
  },
  following: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    ref: 'User',
    select: false,
  },
  followingTopics: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    select: false,
  },
  likingAnswers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    select: false,
  },
  dislikingAnswers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    select: false,
  },
  collectingAnswers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    select: false,
  },
}, {
  timestamps: true
});

module.exports = model('User', userSchema);
