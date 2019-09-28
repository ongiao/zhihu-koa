/*
 * @Description: 
 * @version: 
 * @Author: Junxing
 * @Date: 2019-09-21 00:18:40
 */
const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const questionSchema = new Schema({
    __v: { type: Number, select: false },
    title: { type: String, required: true },
    description: { type: String, required: false },
    questioner: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
    topics: { type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }], select: false },
}, {
    timestamps: true
});

module.exports = model('Question', questionSchema);
