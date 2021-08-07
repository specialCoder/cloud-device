const Koa = require('koa');
const path = require('path');
const fs = require('fs');
// const static = require('koa-static');
const send = require('koa-send');
const views = require('koa-views');
const Router = require('koa-router');

const app = new Koa();
const INITIAL_PATH = '/';
const BSAH_URL = '/Users'

const isDir = (file) => {
    const stats = fs.statSync(file);
    return stats.isDirectory();
}

const getExtname = (pathname) => {
    const extname = path.extname(pathname);
    return extname;
}

const readFile = async (pathname) => {
    try{
            if(isDir(pathname)){
                // const list = fs.readdirSync(pathname, 'utf-8');
                const list = fs.readdirSync(pathname, 'utf-8');
                // return Promise.resolve(list.map((key) => {
                //     return `${pathname}${key}`
                // }));
                // console.log('list-->', list);
                return {
                    type:'dir',
                    list
                };
            }else{
                return Promise.resolve({
                    type:'file',
                    list: [pathname]
                });
            }

    }catch(error){
        console.log('error--->',error);
    }

}

app.use(views(__dirname + '/views', {
    extension:'pug'
}))

const router = new Router();
router.get('/', async(ctx) => {
    ctx.redirect(BSAH_URL);
    ctx.status = 302;
});

app.use(router.routes())

// app.use(router.routes());
app.use(async ( ctx) =>{
    // console.log('ctx url--->', ctx.request.url);
    let basePath = INITIAL_PATH;
    const { url = '' } = ctx.request;
    const newUrl = url.replace(basePath, '');
    const pathname = path.join(basePath, newUrl);
    console.log('pathname--->', pathname);

    const { type, list = []} = await readFile(pathname);
    if(type === 'dir' ){
        basePath = `${basePath}${newUrl}`;
        await ctx.render('index', { list: list.map((key) => {
            return `${basePath === INITIAL_PATH ? '' : basePath}/${key}`;
        }) });
    }else{
        await send(ctx,list[0], {
            root: INITIAL_PATH
        });
        // if(getExtname(pathname) === '.mp4'){
        //     await ctx.render('video', { 
        //         source:list[0]
        //         // source:'./publish/04.mp4'
        //     });
        // }else{
        //     await send(ctx,list[0], {
        //         root: INITIAL_PATH
        //     });
        // }
    }
})

app.listen(8888, () => {
    console.log('port 8888 is listening...');
})