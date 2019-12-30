// 静态服务器

/**
 * 缓存
 * 304对比缓存 服务端设置 协商缓存
 * 强制缓存
   // no-store 表示的是不缓存
  // no-cache 缓存但是每次都像服务器发请求
 * 
 * 协商缓存
 */



const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs").promises;
const { createReadStream } = require("fs");
const mime = require("mime");
const chalk = require("chalk");// 粉笔 用于美化
class Server {
  constructor(config) {
    this.port = config.port || 3000;
    this.cwd = config.cwd || process.cwd();
  }
  async handleRequest(req, res) {
    let { pathname } = url.parse(req.url);
    pathname = decodeURIComponent(pathname); // 中文url会自动编码，先解码回来
    let filepath = path.join(this.cwd, pathname);
    try {
      let statObj = await fs.stat(filepath);
      if (statObj.isDirectory()) { // 判断是文件
        let dirs = await fs.readdir(filepath) // 读取文件内文件列表
        if(dirs.indexOf('index.html') != '-1'){ // 判断是否有index.html
            this.sendFile(req, res, path.join(filepath,'index.html'));
        }else{
          this.sendFileList(req,res,dirs)
        }
      }else{
        this.sendFile(req, res, filepath);
      }
    } catch (e) {
      this.sendError(req, res, e);
    }
  }
  sendFileList(req,res,dirs){
    /**
     * 此处为简单的服务端渲染，可以用ejs等模版引擎对页面进行优化
     */
    let str = ''
    dirs.forEach(dir=>{
      res.setHeader("Content-Type", "text/html;charset=utf-8");
      str += `<a href="/${dir}">./${dir}</a> </br>`
    })
    res.write(str)
    res.end();
  }
  cache(){
    // 返回boolean 是否需要缓存
  }                                                        
  sendFile(req, res, filepath) {
    console.log(filepath)
    // 做缓存
    // 5秒内 先做强制缓存
    // 5秒
    res.setHeader('Cache-Control','max-age=5'); //强制缓存。设置缓存，状态码依旧是200。图片、logo
    res.setHeader('Expires',new Date(Date.now()+5*1000).toGMTString())
    
    
    res.setHeader("Content-Type", mime.getType(filepath) + ";charset=utf-8");
    createReadStream(filepath).pipe(res);
  }
  sendError(req, res, err) {
    res.statusCode = 404;
    res.end("Not Found");
  }
  /**
   * 获取ip地址
   */
  getIPAddress(){
    const interfaces = require('os').networkInterfaces();
    for(let devName in interfaces){
      let iface = interfaces[devName];
        for(let i=0;i<iface.length;i++){
          let alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                return alias.address;
            }
        }
    }
  }
  /**
   * 启动
   */
  start() {
    let IPvs = this.getIPAddress()
    let server = http.createServer(this.handleRequest.bind(this));
    server.listen(this.port, () => {
      console.log(`${chalk.yellow("Starting up http-server, serving ./")}
  Available on:
  http://127.0.0.1:${chalk.green(this.port)}
  http://${IPvs}:${chalk.green(this.port)}
Hit CTRL-C to stop the server
    `);
    });
  }
}
module.exports = Server;