/*
 * @Description: 
 * @version: 
 * @Author: Junxing
 * @Date: 2019-09-20 13:11:03
 */
const fs = require('fs');

module.exports = (app) => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') {
      return;
    }
    const route = require(`./${file}`);
    app.use(route.routes()).use(route.allowedMethods());
  })
}