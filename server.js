// Autherication  인증    Authorization 허가 

//요약정보//REST API Key : 0b57f4fa9c30dc13d6b5fef12f3f527b
//카카오 로그인////redirect URi : http://localhost:8000/auth/kakao/callback 
//카카오 보안 //secret Key  :  	TAgO4qiVqO6oB2spaQ4uhG8D2GQfekgH

const express = require('express'); 
const nunjucks = require('nunjucks');
// npm install axios  
const axios = require('axios');
//npm install qs
const qs = require('qs');
const app = express(); 
const session = require('express-session');
const bodyParser = require('body-parser');
const e = require('express');
const { text } = require('body-parser');

app.set('veiw engine','html'); 
nunjucks.configure('views',{ 
  express:app, 
})

const kakao = { 
  clientID:'0b57f4fa9c30dc13d6b5fef12f3f527b', 
  clientSecret: `TAgO4qiVqO6oB2spaQ4uhG8D2GQfekgH`,
  redirectUri: `http://localhost:3000/auth/kakao/callback`
}
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:false,}))
app.use(session({
  secret:'123',
  resave:false,
  secure:false,
  saveUninitialized:false,
}))



app.get('/',(req,res)=>{
  const {msg} = req.query;
  res.render('index.html',{
     msg,
     logininfo:req.session.authData, 
  });
});

app.get('/login',(req,res)=>{
  res.render('login.html')
})

app.post('/login',(req,res)=>{ 
  const {session,body} = req;
  const {userid, userpw} = body;
  
  if(userid=='root' && userpw=="root"){ 
    //로그인 성공
    const data ={ 
      userid, 
    }
    session.authData={ 
      ["local"]: data,
    }

    res.redirect('/?msg=로그인이 완료되었습니다.')
  } else{ 
    //로그인 실패 
    res.redirect('/?msg=아이디와 패스워드를 확인해주세요.')

  }
})

app.get('/auth/kakao',(req,res)=>{ 
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`; 
  res.redirect(kakaoAuthURL); 
})


//로그인 해달라 && 로그인한 사람 정보를 줘라
app.get(`/auth/kakao/callback`,async (req,res)=>{
  const {session,query} = req; //session = req.session
  const {code} = query;    //code = query.code


  //axios
  let token; 
  try{ 
    token = await axios({
      method:'post',
      url:`https://kauth.kakao.com/oauth/token`,
      headers:{
        'content-type':'application/x-www-form-urlencoded'
      },
      data:qs.stringify({
        grant_type:'authorization_code', //특정 스트링
        client_id:kakao.clientID,
        client_secret:kakao.clientSecret,
        redirectUri:kakao.redirectUri,
        code:code, 
      })
    })
    
  }catch(e){ 
    res.json(e.data);
  }
  
  let user; 
  try{ 
    user = await axios({
      method:'GET',
      url:`https://kapi.kakao.com/v2/user/me`, 
      headers:{ 
        Authorization:`Bearer ${token.data.access_token}`
      }
    })
  }catch(e){ 
    res.json(e.data);
  }

  // req.session.kakao= user.data; //세션에 담아주기. 
  //req.session = {  ['kakao]' : user.data, }
  
  const authData = { 
    ...token.data,      //비구조 할당문 ,//깊은 복사 
    ...user.data,       //원본이 바뀌더라도 처음에 선언된 내용으로 쓰겠다. 
  }

  session.authData = { 
    ["kakao"]:authData, 
  }

  
  res.redirect('/'); 
})

const authMiddleware = (req,res,next)=>{ 
  const {session} = req; 
  if(session.authData==undefined){ 
    console.log('로그인 되어있지 않습니다.'); 
    res.redirect('/?msg=로그인 되어있지 않음.'); 
  } else{ 
    console.log('로그인 되어 있음'); 
    next(); 
  }
}


app.get('/auth/info',authMiddleware,(req,res)=>{ 
  // let {nickname, profile_image} = req.session.kakao.properties; 

  const {authData} = req.session;
  const proVider = Object.keys(req.session.authData)[0]; 

  switch(proVider){ 
    case "kakao":
      userinfo = { 
        userid:authData[proVider].properties.nickname,
      }
      break;
    case "local": 
      userinfo = { 
        userid:authData[proVider].userid,
      }
      break; 
  }
  res.render('info.html',{
    // nickname,profile_image,
    userinfo, 
  })
});

//카카오 or 로그아웃 
app.get('/auth/kakao/unlink', async(req,res)=>{
  const {session} = req; 
  const {access_token}=session.authData.kakao; 

  
              //요청 
  let unlink; 
  try{ 
    unlink = await axios({
      method:'POST',
      url:"https://kapi.kakao.com/v1/user/unlink",
      headers: { 
        Authorization:`Bearer ${access_token}`
      }
    })
  } catch(e){ 
    res.json(e.data); 
  }

  const {id} = unlink.data;
  
            // 세션을 지워야함. 

  if(session.authData["kakao"].id=id){ 
    delete session.authData; 
  }


  res.redirect('/?msg=로그아웃되었습니다.')
})

app.get('/login2',(req,res)=>{
  // console.log(req.headers);
  //res.setHeader('application/x-www-form-urlencoded')
  // res.set('token','duck')
  // res.set('Authorization','Bearer duck')
  // console.log(req.body)
  // res.json({text:'ok'}); 
// res.status(200).json({text:'error'})
res.status(200).json({text:'error'});

}); 

app.get("/auth/logout",(req,res)=>{
  const {session} = req; 
  const {authData} = req.session;
  const proVider = Object.keys(authData)[0];
  switch(proVider){
    case "local": 
      delete session.authData; 
      res.redirect('/?msg=로그아웃되었습니다.'); 
      break;
    case "kakao": 
      res.redirect('/auth/kakao/unlink');
      break; 
  }

})

app.listen(3000,()=>{
  console.log('hello port3000');
})




