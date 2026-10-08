import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const PORT=process.env.PORT||4000;
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const vehicles=[
{id:'car-1',type:'car',name:'Suzuki Swift',category:'Compact Car',fuel:'Petrol',transmission:'Manual',seats:5,hourly:120,daily:800,weekly:4800,city:'Delhi',available:true,tag:'Most popular'},
{id:'car-2',type:'car',name:'Hyundai Aura',category:'Commercial Sedan',fuel:'CNG',transmission:'Manual',seats:5,hourly:135,daily:900,weekly:5400,city:'Bengaluru',available:true,tag:'High mileage'},
{id:'bike-1',type:'bike',name:'Honda Shine',category:'Delivery Bike',fuel:'Petrol',transmission:'Manual',seats:2,hourly:60,daily:220,weekly:1200,city:'Delhi',available:true,tag:'Low cost'},
{id:'bike-2',type:'bike',name:'TVS Raider',category:'Delivery Bike',fuel:'Petrol',transmission:'Manual',seats:2,hourly:65,daily:240,weekly:1300,city:'Bengaluru',available:true,tag:'Popular'},
{id:'lcv-1',type:'lcv',name:'Tata Ace',category:'Mini Truck',fuel:'Diesel',transmission:'Manual',seats:2,hourly:180,daily:1100,weekly:6500,city:'Delhi',available:true,tag:'Porter ready'},
{id:'lcv-2',type:'lcv',name:'Mahindra Jeeto',category:'Mini Truck',fuel:'Diesel',transmission:'Manual',seats:2,hourly:190,daily:1200,weekly:7000,city:'Bengaluru',available:true,tag:'Cargo ready'}];
const platforms=[{id:'uber',name:'Uber',connected:true,label:'Ride-hailing'},{id:'ola',name:'Ola',connected:true,label:'Ride-hailing'},{id:'rapido',name:'Rapido',connected:true,label:'Bike taxi'},{id:'porter',name:'Porter',connected:true,label:'Logistics'}];
let bookings=[];let kycRecords=[];
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end(JSON.stringify(data))}
async function body(req){let s='';for await(const c of req)s+=c;return s?JSON.parse(s):{}}
function staticFile(req,res){let p=new URL(req.url,'http://x').pathname;if(p==='/')p='/index.html';const f=path.join(ROOT,path.normalize(p).replace(/^\.\.(\/|\\)+/,''));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return false;const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);return true}
http.createServer(async(req,res)=>{if(req.method==='OPTIONS')return json(res,204,{});const u=new URL(req.url,'http://x');try{
if(u.pathname==='/api/health')return json(res,200,{ok:true,service:'GigDrives API'});
if(u.pathname==='/api/vehicles')return json(res,200,vehicles);
if(u.pathname==='/api/platforms')return json(res,200,platforms);
if(u.pathname==='/api/bookings'&&req.method==='GET')return json(res,200,bookings);
if(u.pathname==='/api/bookings'&&req.method==='POST'){const d=await body(req),v=vehicles.find(x=>x.id===d.vehicleId);if(!v)return json(res,400,{error:'Vehicle not found'});const total=d.duration==='hour'?v.hourly:d.duration==='week'?v.weekly:v.daily;const b={id:'GD-'+Math.floor(1000+Math.random()*8999),...d,total,status:'Confirmed',vehicle:v.name,createdAt:new Date().toISOString()};bookings.unshift(b);return json(res,201,b)}
if(u.pathname==='/api/earnings')return json(res,200,{today:1980,week:8400,month:26700,target:30000,trips:126,chart:[2400,3100,2800,4200,3900,5100,5200]});
if(u.pathname==='/api/kyc'&&req.method==='POST'){const d=await body(req),k={id:'KYC-'+Date.now(),...d,status:'Verified',createdAt:new Date().toISOString()};kycRecords.push(k);return json(res,201,k)}
if(u.pathname.startsWith('/api/platforms/')&&u.pathname.endsWith('/toggle')&&req.method==='POST'){const id=u.pathname.split('/')[3],p=platforms.find(x=>x.id===id);if(!p)return json(res,404,{error:'Platform not found'});p.connected=!p.connected;return json(res,200,p)}
if(req.method==='GET'&&staticFile(req,res))return;
if(req.method==='GET'){req.url='/index.html';if(staticFile(req,res))return}
json(res,404,{error:'Not found'})}catch(e){json(res,500,{error:e.message})}}).listen(PORT,()=>console.log('GigDrives running on '+PORT));