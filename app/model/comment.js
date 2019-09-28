/*
 * @Description: 
 * @version: 
 * @Author: Junxing
 * @Date: 2019-09-21 00:18:40
 */
const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const commentSchema = new Schema({
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    commentator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: String, required: true },
    answerId: { type: String, required: true },
    rootCommentId: { type: String, required: false },
    replyTo: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {
    timestamps: true
});

module.exports = model('Comment', commentSchema);
