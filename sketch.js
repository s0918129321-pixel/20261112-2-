// 宣告全域變數，用來存放停止、走路、施法與特效的圖片精靈
let stopSprite, walkSprite, magicSprite, effectSprite;
// 宣告陣列存放各狀態裁切後的影格圖片
let stopFrames = [];
let walkFrames = [];
let magicFrames = [];
let effectFrames = [];

// 設定停止精靈的總張數與尺寸
const stopTotalFrames = 10;
const stopSheetWidth = 1385;
const stopSheetHeight = 212;
const stopFrameWidth = stopSheetWidth / stopTotalFrames;
const stopFrameHeight = stopSheetHeight;

// 設定走路精靈的總張數與尺寸
const walkTotalFrames = 9;
const walkSheetWidth = 1201;
const walkSheetHeight = 198;
const walkFrameWidth = walkSheetWidth / walkTotalFrames;
const walkFrameHeight = walkSheetHeight;

// 設定施法精靈的總張數與尺寸（8張，寬1243，高211）
const magicTotalFrames = 8;
const magicSheetWidth = 1243;
const magicSheetHeight = 211;
const magicFrameWidth = magicSheetWidth / magicTotalFrames;
const magicFrameHeight = magicSheetHeight;

// 設定特效精靈的總張數與尺寸（18張，寬6025，高248）
const effectTotalFrames = 18;
const effectSheetWidth = 6025;
const effectSheetHeight = 248;
const effectFrameWidth = effectSheetWidth / effectTotalFrames;
const effectFrameHeight = effectSheetHeight;

// 宣告目前播放的影格索引值
let currentFrame = 0;
// 宣告角色在畫布上的 X 軸與 Y 軸座標
let posX, posY;
// 設定角色的移動速度（像素/影格）
let speed = 5;
// 宣告角色面向的方向：true 代表面向右側，false 代表面向左側
let facingRight = true;
// 宣告角色狀態："STOP" (停止), "WALK" (走路), "MAGIC" (施法)
let currentState = "STOP";

// 宣告特效物件陣列，用來管理畫面上同時存在的特效
let effects = [];

// p5.js 預先載入函式，於程式執行前載入所有圖片精靈檔案
function preload() {
  stopSprite = loadImage('1/stop/stop1.png');
  walkSprite = loadImage('1/walk/walk1.png');
  magicSprite = loadImage('1/magic/magic1.png');
  effectSprite = loadImage('1/magiceffect/magiceffect1.png');
}

// p5.js 初始化設定函式，程式啟動時執行一次
function setup() {
  // 建立符合視窗大小的全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 設定每秒更新 12 個影格
  frameRate(12);

  // 裁切停止精靈影格
  for (let i = 0; i < stopTotalFrames; i++) {
    let sx = i * stopFrameWidth;
    stopFrames.push(stopSprite.get(sx, 0, stopFrameWidth, stopFrameHeight));
  }

  // 裁切走路精靈影格
  for (let i = 0; i < walkTotalFrames; i++) {
    let sx = i * walkFrameWidth;
    walkFrames.push(walkSprite.get(sx, 0, walkFrameWidth, walkFrameHeight));
  }

  // 裁切施法精靈影格
  for (let i = 0; i < magicTotalFrames; i++) {
    let sx = i * magicFrameWidth;
    magicFrames.push(magicSprite.get(sx, 0, magicFrameWidth, magicFrameHeight));
  }

  // 裁切特效精靈影格
  for (let i = 0; i < effectTotalFrames; i++) {
    let sx = i * effectFrameWidth;
    effectFrames.push(effectSprite.get(sx, 0, effectFrameWidth, effectFrameHeight));
  }

  // 初始化角色位置在整個畫布寬度的 2/3 處
  posX = width * (2 / 3);
}

// 當按下鍵盤按鍵時觸發
function keyPressed() {
  // 檢查是否按下空白鍵 (keyCode 32 或 key === ' ')
  let isSpacebar = (keyCode === 32 || key === ' ');
  
  // 當按下空白鍵且目前不是在施法狀態時，切換為施法狀態
  if (isSpacebar) {
    if (currentState !== "MAGIC") {
      currentState = "MAGIC";
      currentFrame = 0; // 重置影格，從第 1 張開始播放
    }
  }
}

// p5.js 重複繪製函式，每秒持續執行更新畫面
function draw() {
  // 清除畫布並設定背景色
  background(240);

  // 設定角色在畫布上的顯示高度為整個畫布高度的 1/3
  let displayHeight = height / 3;

  // 如果角色正在施法狀態
  if (currentState === "MAGIC") {
    // 播放施法動畫，影格累加
    currentFrame += 1;
    // 當 8 張圖片完整播放完畢一次後
    if (currentFrame >= magicTotalFrames) {
      currentState = "STOP"; // 恢復為停止狀態
      currentFrame = 0;

      // 施法完成瞬間，在角色位置產生一個新的特效物件
      effects.push({
        x: posX,
        y: height - (displayHeight / 2),
        dir: facingRight ? 1 : -1, // 1代表往右，-1代表往左
        frameIndex: 0
      });
    }
  } 
  // 如果非施法狀態，檢查左右鍵輸入
  else {
    let moving = false;
    if (keyIsDown(RIGHT_ARROW)) {
      facingRight = true;
      moving = true;
    } else if (keyIsDown(LEFT_ARROW)) {
      facingRight = false;
      moving = true;
    }

    // 狀態在走路與停止之間切換
    let newDesiredState = moving ? "WALK" : "STOP";
    if (newDesiredState !== currentState) {
      currentState = newDesiredState;
      currentFrame = 0;
    }

    // 計算當前狀態的寬高縮放
    let currentFHeight = (currentState === "WALK") ? walkFrameHeight : stopFrameHeight;
    let scaleRatio = displayHeight / currentFHeight;
    let currentFWidth = (currentState === "WALK") ? walkFrameWidth : stopFrameWidth;
    let displayWidth = currentFWidth * scaleRatio;

    // 若正在走路，根據方向更新 X 座標並限制在畫布範圍內
    if (currentState === "WALK") {
      if (facingRight) {
        if (posX < width - displayWidth / 2) posX += speed;
      } else {
        if (posX > displayWidth / 2) posX -= speed;
      }
    }
  }

  // 取得當前角色狀態對應的圖片影格陣列與尺寸
  let currentFrames, fWidth, fHeight;
  if (currentState === "MAGIC") {
    currentFrames = magicFrames;
    fWidth = magicFrameWidth;
    fHeight = magicFrameHeight;
  } else if (currentState === "WALK") {
    currentFrames = walkFrames;
    fWidth = walkFrameWidth;
    fHeight = walkFrameHeight;
  } else {
    currentFrames = stopFrames;
    fWidth = stopFrameWidth;
    fHeight = stopFrameHeight;
  }

  // 計算縮放比例與顯示寬度
  let scaleRatio = displayHeight / fHeight;
  let displayWidth = fWidth * scaleRatio;
  posY = height - (displayHeight / 2);

  // 繪製角色本體
  imageMode(CENTER);
  push();
  translate(posX, posY);
  if (!facingRight) {
    scale(-1, 1); // 左右翻轉
  }
  let drawIndex = Math.min(Math.floor(currentFrame), currentFrames.length - 1);
  image(currentFrames[drawIndex], 0, 0, displayWidth, displayHeight);
  pop();

  // 若非施法狀態，讓角色動畫影格循環播放
  if (currentState !== "MAGIC") {
    currentFrame = (currentFrame + 1) % currentFrames.length;
  }

  // 處理並繪製畫面上所有的特效
  for (let i = effects.length - 1; i >= 0; i--) {
    let eff = effects[i];
    
    // 特效移動邏輯（速度設為 12 像素/影格）
    eff.x += eff.dir * 12;

    // 計算特效的顯示大小
    let effScale = displayHeight / effectFrameHeight;
    let effWidth = effectFrameWidth * effScale;
    let effHeight = displayHeight;

    // 繪製特效
    push();
    translate(eff.x, eff.y);
    if (eff.dir === -1) {
      scale(-1, 1); // 如果特效往左，進行水平翻轉
    }
    let effDrawIndex = Math.min(Math.floor(eff.frameIndex), effectFrames.length - 1);
    image(effectFrames[effDrawIndex], 0, 0, effWidth, effHeight);
    pop();

    // 更新特效的動畫影格
    eff.frameIndex += 1.5; 

    // 當特效動畫播完 或 特效碰到畫布左右邊端時，從陣列中移除該特效
    if (eff.frameIndex >= effectTotalFrames || eff.x > width + effWidth || eff.x < -effWidth) {
      effects.splice(i, 1);
    }
  }
}

// 當瀏覽器視窗大小改變時自動觸發，調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}