// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

// Variables for status messages
let modelIsLoaded = false;
let webGLWarning = "";

function preload() {
  // Initialize HandPose model with a callback function for when it's ready
  handPose = ml5.handPose({ flipped: true }, modelReady);
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

// Callback function for when the HandPose model is loaded
function modelReady() {
  console.log("HandPose Model is ready!");
  modelIsLoaded = true;
}

function setup() {
  // 第一步驟：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 擷取攝影機影像，加入 flipped 屬性配合 ml5 左右翻轉
  video = createCapture(VIDEO, { flipped: true });
  video.hide(); // 隱藏 p5.js 預設產生的 HTML <video> 元素，只在畫布中繪製
  
  // Check for WebGL support and set a warning message if it's not available
  if (!window.WebGLRenderingContext) {
    webGLWarning = "警告：您的設備不支援 WebGL，辨識功能可能無法正常運作。";
    console.warn(webGLWarning);
  }
  
  // Start detecting hands
  handPose.detectStart(video, gotHands);
  
  // 將圖片/影像的繪製對齊模式設定為「中心點」，方便後續置中
  imageMode(CENTER);
}

function draw() {
  // 設定畫布的背景顏色為 #e7c6ff
  background('#e7c6ff');
  
  // 顯示影像在畫布正中間 (width/2, height/2)，並且將寬高設定為畫布寬高的 50%
  let drawW = width * 0.5;
  let drawH = height * 0.5;
  image(video, width / 2, height / 2, drawW, drawH);

  // Only attempt to draw hands if the model is loaded
  if (modelIsLoaded && hands.length > 0 && video.width > 0) {
    // 計算繪製的起始座標 (左上角) 以及縮放比例
    let startX = width / 2 - drawW / 2;
    let startY = height / 2 - drawH / 2;
    let scaleX = drawW / video.width;
    let scaleY = drawH / video.height;

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 先將所有關節點的座標計算出來並儲存在陣列中
        let pts = [];
        for (let i = 0; i < hand.keypoints.length; i++) {
          let px = startX + hand.keypoints[i].x * scaleX;
          let py = startY + hand.keypoints[i].y * scaleY;
          pts.push({ x: px, y: py });
        }

        // 畫出手指的骨架線條
        stroke(255); // 設定線條為白色
        strokeWeight(3); // 設定線條粗細

        // 0到4串接 (大拇指)
        for (let i = 0; i < 4; i++) { line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); }
        // 5到8串接 (食指)
        for (let i = 5; i < 8; i++) { line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); }
        // 9到12串接 (中指)
        for (let i = 9; i < 12; i++) { line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); }
        // 13到16串接 (無名指)
        for (let i = 13; i < 16; i++) { line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); }
        // 17到20串接 (小拇指)
        for (let i = 17; i < 20; i++) { line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); }

        // 畫出關節點的圓圈
        for (let i = 0; i < pts.length; i++) {
          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(pts[i].x, pts[i].y, 16);
        }
      }
    }
  }

  // Display a "Loading..." message until the model is ready
  if (!modelIsLoaded) {
    push();
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("正在載入辨識模型...", width / 2, height / 2);
    pop();
  }

  // Display the WebGL warning at the bottom if it was set
  if (webGLWarning) {
    push();
    fill(255, 0, 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(webGLWarning, width / 2, height - 40);
    pop();
  }
}

// 當視窗大小改變時，自動調整畫布尺寸以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
