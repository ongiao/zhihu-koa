/*
 * @Description: 
 * @version: 
 * @Author: Junxing
 * @Date: 2019-09-20 14:05:02
 */

const path = require('path');

class HomeController {
  index(ctx) {
    ctx.body = '<h1>这是主页</h1>';
  }

  async upload(ctx) {
    const file = ctx.request.files.file;
    const basename = path.basename(file.path);
    ctx.body = { url: `${ctx.origin}/uploads/${basename}` };
  }
}

module.exports = new HomeController();