import { dialog, app, Notification, shell } from 'electron';
import Koa from 'koa';
import Router from '@koa/router';
// import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';
import multer from '@koa/multer';
import fs from 'fs';
import path from 'path';

const httpPort = 23333
// const multer = require('@koa/multer');

// const bodyParser = require('koa-body');
// const multer2 = require('multer');

// if (multer2) {
//   dialog.showErrorBox('multer 存在', 'multer 存在multer 存在');
// }

dialog.showErrorBox('1222', 'mmmm3');

const koaApp = new Koa();
const router = new Router();
let serverStatus = false;

const filePath = app.getPath('downloads');

const fileExist = (file: string) => {
  let isExist = false;
  try {
    // 确定文件是否存在及是否有可读属性
    isExist = fs.existsSync(file);
  } catch (err) {
    /* empty */
  }
  return isExist;
};

const genNewFileName = (_path: string) => {
  const fileExt = path.extname(_path);
  const fileName = path.basename(_path).replace(fileExt, '');
  const destPath = _path.replace(path.basename(_path), '');
  let count = 1;
  const rname = () => {
    const name = path.join(destPath, `${fileName}-(${count})`);
    return `${name}${fileExt}`;
  };
  while (fileExist(rname())) {
    // eslint-disable-next-line no-plusplus
    count++;
  }
  // return path.join(destPath, `${fileName}-(${count})${fileExt}`);
  return `${fileName}-(${count})${fileExt}`;
};

function handlefileName(fileName: string) {
  let realpath = `${filePath}/${fileName}`;
  const isExist = fileExist(realpath);
  if (isExist) {
    realpath = genNewFileName(realpath);
  }
  return realpath;
}

// 上传文件存储配置;
const storage = multer.diskStorage({
  destination(req: any, file: any, cb: any) {
    cb(null, app.getPath('downloads')); // 上传的文件存储的目录
  },
  filename(req: any, file: any, cb: any) {
    cb(
      null,
      handlefileName(Buffer.from(file.originalname, 'binary').toString())
        .split('/')
        .pop()
    ); // 上传文件的名称
  },
});

// 使用配置文件初始化multer
const upload = multer({ storage });

koaApp
  .use(cors({ exposeHeaders: '*' }))
//   .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

// router.post('/ping', async (ctx) => {
//   const { ping } = ctx.request.body ?? {};
//   ctx.body = {
//     code: 200,
//     data: ping,
//     msg: '成功',
//   };
// });

router.get('/test', (ctx) => {
  ctx.body = 'test';
});

router.post('/file', upload.array('file', 10), async (ctx) => {
  const orgFiles = ctx.request.file;
  const files = orgFiles;
  const not = new Notification({
    title: `文件接收成功`,
    body: '点击打开文件',
  });
  const shellOpenPath = files.path;
  not.show();
  not.on('click', () => {
    shell.openPath(shellOpenPath ?? app.getPath('downloads'));
  });
  ctx.body = {
    code: 200,
    msg: '文件发送成功',
  };
});

const startServer = async () => {
  if (!serverStatus) {
    koaApp.listen(httpPort, '0.0.0.0', () => {
      serverStatus = true;
    });
  }
};

export default startServer;
