const express = require('express'); 
const nunjucks = require('nunjucks'); 
const bodyParser = require('body-parser'); 
const app = express(); 

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:false})); 

app.set('view engine','html'); 
nunjucks.configure('views',{ 
  express:app,
})

app.get('/',(req,res)=>{ 
  res.render('index2.html');
})

app.get('/login',(req,res)=>{
  let {userid,userpw} = req.query; 
  console.log(userid,userpw); 

  res.setTimeout(3000,()=>{ 
    res.send(`GET OK${userid} / ${userpw}`); 

  }); 
})

app.post('/login',(req,res)=>{ 
  let {userid,userpw} = req.body; 
  console.log(userid,userpw); 
  res.send(`POST OK${userid} / ${userpw}`); 
})

app.listen( 3000, ()=>{ 
  console.log('server start 3000'); 
})

// 파이어폭스 개발자도구 네트워크 헤더와 응답.
//헤더에는 요청, 응답에 대한 헤더. 
//응답에는 응답내용이 담겨있다.  

 //'application/x-www-form-urlencoded' 의 의미는 쿼리스트링
 
 //nunjucks 의 역할을 html를 만드는 것. 
 //html에 {{title}}
 //get에  title:'kkk' 라는 객체를 담아 보내주면. 
 //nunjucks가 {{title}} 부분을 kkk로 바꿈. 
 //문서를 바꿔서 보냄!(보내기 전에 바꾸고^^)
 //render => 넌적스를 사용하겠다. 
 //넌적스는 render하려는 html의 넌적스 구문을 읽어서 html문서를 갱신하고 전달함.
 //

 //http 프로토콜 한번의 요청에는 한번의 응답
 //요청에서는 스타트라인이 중요함

 //fetch 페이지 이동없이 데이터를 주고 받을 수 있음^^ 
 //비동기 통신은 응답이 오기 전에 요청을 보낼 수 있음. 

 //http 프로토콜은  네트워크 계층 최상위에 위치하는 애플리케이션 계층의 프로토콜로

//인터넷상에서 데이터를 주고 받기 위한 서버/클라이언트 모델을 따르는 프로토콜이다.