/*
 * @Description: app.js
 * @version: 1.0.0
 * @Author: Junxing
 * @Date: 2019-09-18 19:32:01
 */
const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const koaStatic = require('koa-static');
const json = require('koa-json');
const error = require('koa-json-error');
const koaBody = require('koa-body');
const path = require('path');
const logger = require('koa-logger');
const routing = require('./app/routes');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const { mongoUrl } = require('./app/config');

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log('MongoDB started successful!!');
});
mongoose.connection.on('error', console.error);

// error handler
app.use(error({
  postFormat: (err, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}));

// middlewares
app.use(koaStatic(path.join(__dirname, '/app/public')));
app.use(koaBody({
  multipart : true,
  formidable: {
    uploadDir     : path.join(__dirname, '/app/public/uploads'),
    keepExtensions: true,
  },
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));
app.use(parameter(app));
routing(app);

app.use(views(__dirname + '/views', {
  extension: 'pug',
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next()
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.listen(3000, () => {
  console.log('Server starting at port 3000');
});

module.exports = app
