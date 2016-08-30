
// 兔子
function Player(cxt){
  gameMonitor.im.loadImage(['imgs/player.png'])

  this.height = 80;
  this.width = 80;
  this.left = gameMonitor.w/2 - this.width/2;
  this.top = gameMonitor.h - 2*this.height;

  this.player = gameMonitor.im.createImage('imgs/player.png');

  this.init = (() => {
    cxt.drawImage(this.player, this.left, this.top, this.width, this.height)
  })

  this.setPosition = function(event){
    var tarL, tarT;
    if(gameMonitor.isMobile()){
      tarL = event.changedTouches[0].clientX;
      tarT = event.changedTouches[0].clientY;
    }else{
      tarL = event.offsetX;
      tarT = event.offsetY;
    }

    this.left = tarL - this.width/2 -16;
    this.top = tarT - this.height/2;

    if(this.left < 0){
      this.left = 0;
    }
    if(this.left > 320-this.width){
      this.left = 320-this.width;
    }
    if(this.top < 0){
      this.top = 0;
    }
    if(this.top > gameMonitor.h - this.height){
      this.top = gameMonitor.h - this.height;
    }
    this.init();
  }

  this.controll = function(){
    var stage = document.getElementById('gamepanel');
    var currentX = this.left,
        currentY = this.top,
        move = false

    stage.addEventListener(gameMonitor.eventType.start, (event)=>{
      this.setPosition(event);
      move = true;
    })
    stage.addEventListener(gameMonitor.eventType.end, (event)=>{
      move = false;
    })
    stage.addEventListener(gameMonitor.eventType.move, (event)=>{
      event.preventDefault();
      if(move){
        this.setPosition(event);
      }
    })
  }

  this.eat = function(foodList){
    for(var i = foodList.length - 1; i >= 0; i--){
      var f = foodList[i];
      if(f){
        var l1 = this.top + this.height/2 - (f.top + f.height/2);
        var l2 = this.left + this.width/2 - (f.left + f.width/2);
        var l3 = Math.sqrt(l1*l1 + l2*l2);
        if(l3 <= this.height/2 + f.height/2){
          foodList[f.id] = null;
          if(f.type == 0){
            gameMonitor.stop(cxt);
            console.log('结束！');
            setTimeout(function(){

            },2000)
          }else{
            var score = document.getElementById('score');
            gameMonitor.score += f.score;
            score.innerHTML = gameMonitor.score;
          }
        }

      }
    }
  }
}

// 月饼
function Food(type, left, id){
  this.speedUpTime = 300;
  this.id = id;
  this.type = type;
  this.width = 50;
  this.height = 50;
  this.left = left;
  this.top = -50;
  this.speed = 0.04 * Math.pow(1.2, Math.floor(gameMonitor.time/this.speedUpTime));
	this.loop = 0;
  this.score = 0;
  this.foodList = [
    {
      type: 0,
      score: 0,
      img: 'imgs/food1.png'
    },{
      type: 1,
      score: 100,
      img: 'imgs/food2.png'
    }
  ];
  var p = null;
  for(var i=0; i<= this.foodList.length-1; i++){
    var item = this.foodList[i];
    if(item.type == type){
      p = item;
      this.score = item.score;
      this.pic = gameMonitor.im.createImage(p.img);
    }
  }

  this.paint = function(cxt){

    if(this.pic){
      cxt.drawImage(this.pic, this.left, this.top, this.width, this.height);
    }

  }

  this.move = function(cxt){
    if(gameMonitor.time % this.speedUpTime == 0){
      this.speed *= 1.2;
    }
    this.top += ++this.loop * this.speed;
    if(this.top > gameMonitor.h){
      gameMonitor.foodList[this.id] = null;
    }else{
      this.paint(cxt)
    }
  }
}

function ImageMonitor(){
  var imgArray = [];
  return {
    createImage: function(src){
      return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src])
    },
    loadImage: function(arr, callback){
      for(var i=0, l=arr.length; i< l;i++){
        var img = arr[i];
        imgArray[img] = new Image();
        imgArray[img].onload = function(){
          if(i == l-1 && typeof callback == 'function'){
            callback();
          }
        }
        imgArray[img].src = img
      }
    }
  }
}

var gameMonitor = {
  // 背景
  bg: null,
  w: 320,
  h: 568,
  bgWidth: 320,
  bgHeight: 1126,
  time: 0,
  timmer: null,
  bgSpeed: 2,
  bgloop: 0,
  score: 0,
  im: new ImageMonitor(),
  foodList: [],
  bgDistance: 0,//背景当前位置
  player: null,
  isStop: false,
  eventType: {
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend'
  },
  // 初始化背景
  init: function(){
    var cxt = document.getElementById('stage').getContext('2d');
    var image = new Image();
    image.src = 'imgs/bg.jpg';
    this.bg = image;
    this.player = new Player(cxt);
    this.player.controll();
    this.bg.onload = () => {
      cxt.drawImage(image, 0,0, this.bgWidth, this.bgHeight);
    }
    var player = new Player();

    this.run(cxt);
  },
  //  背景滚动
  rollBg: function(cxt){
    if(this.bgDistance >= this.bgHeight){
      this.bgloop = 0;
    }
    this.bgDistance = ++ this.bgloop * this.bgSpeed;

    cxt.drawImage(this.bg, 0, this.bgDistance - this.bgHeight, this.bgWidth, this.bgHeight);
    cxt.drawImage(this.bg, 0, this.bgDistance, this.bgWidth, this.bgHeight);
  },
  stop: function(cxt){

    clearTimeout(this.timmer);
    this.isStop = true;

    var endImg = this.im.createImage('imgs/endpage.jpg');
    this.im.loadImage(['imgs/endpage.jpg'])
    document.getElementsByClassName('result')[0].style.display = 'block'
  },
  run: function(cxt){
    if(this.isStop){
      return;
    }
    cxt.clearRect(0, 0, this.bgWidth, this.bgHeight);

    this.rollBg(cxt);
    this.player.init();
    this.player.eat(this.foodList);

    this.genorateFood();
    for(var i=this.foodList.length-1; i>=0; i--){
      var f = this.foodList[i];
      if(f){
        f.paint(cxt);
        f.move(cxt);
      }
    }

    clearTimeout(this.timmer);
    this.timmer = setTimeout(()=>{
      this.run(cxt);
    },Math.round(1000/60));
    if(this.time>2500)
      return;
    this.time++;
  },

  reset: function(){
    this.time = 0;
    this.timmer = null;
    this.bgSpeed = 2;
    this.bgloop = 0;
    this.score = 0;
    this.foodList = [];
    this.isStop = false;
    document.getElementById('score').innerHTML = 0;
  },
  isMobile: function(){
    var sUserAgent = navigator.userAgent.toLowerCase(),
        bIsIpad = sUserAgent.match(/ipad/i) == 'ipad',
        bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os',
        bIsMidp = sUserAgent.match(/midp/i) == 'midp',
        bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4',
        bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb',
        bIsAndroid = sUserAgent.match(/android/i) == 'android',
        bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce',
        bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile',
        bIsWebview = sUserAgent.match(/webview/i) == 'webview';
        return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM || bIsWebview)
  },
  //  掉月饼
  genorateFood: function(){
    var genRate = 50;
    var random = Math.random();
    if(random * genRate > genRate - 1){
      var left = Math.random() * (this.w - 50);
      var type = Math.floor(left)%2 == 0 ? 0 : 1;
      var id = this.foodList.length;
      var f = new Food(type, left, id);
      this.foodList.push(f);
    }
  }
}

if(!gameMonitor.isMobile()){
  gameMonitor.eventType.start = 'mousedown';
  gameMonitor.eventType.end = 'mouseup';
  gameMonitor.eventType.move = 'mousemove';
}

gameMonitor.init();
setTimeout(function(){
  gameMonitor.stop();
},60000)
