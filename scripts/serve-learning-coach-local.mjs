import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {handler} from '../netlify/functions/learning-coach.mjs';
// This validation harness always disables model calls; it is not a deployment server.
process.env.LEARNING_COACH_ENABLED='false';
const root=path.resolve(process.env.LEARNING_COACH_LOCAL_DIST??'dist');
http.createServer(async(req,res)=>{try{
 if(req.url==='/api/learning/coach'){let body='';for await(const part of req)body+=part;const r=await handler({httpMethod:req.method,headers:{...req.headers,'x-nf-client-connection-ip':'127.0.0.1'},body});res.writeHead(r.statusCode,r.headers);res.end(r.body);return;}
 let name=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!name.startsWith(root+'/'))throw Error();if(fs.statSync(name).isDirectory())name+='/index.html';const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.md':'text/plain'};res.writeHead(200,{'content-type':types[path.extname(name)]??'application/octet-stream'});fs.createReadStream(name).pipe(res);
}catch{res.writeHead(404);res.end('Not found');}}).listen(8082,'127.0.0.1');
