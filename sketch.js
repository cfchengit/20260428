// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 第一步驟：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 擷取攝影機影像，加入 flipped 屬性配合 ml5 左右翻轉
  video = createCapture(VIDEO, { flipped: true });
  video.hide(); // 隱藏 p5.js 預設產生的 HTML <video> 元素，只在畫布中繪製
  
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

  // Ensure at least one hand is detected and video is loaded
  if (hands.length > 0 && video.width > 0) {
    // 計算繪製的起始座標 (左上角) 以及縮放比例
    let startX = width / 2 - drawW / 2;
    let startY = height / 2 - drawH / 2;
    let scaleX = drawW / video.width;
    let scaleY = drawH / video.height;

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          // 依據縮放與位移重新計算關節點的畫面座標
          let px = startX + keypoint.x * scaleX;
          let py = startY + keypoint.y * scaleY;
          circle(px, py, 16);
        }
      }
    }
  }
}

// 當視窗大小改變時，自動調整畫布尺寸以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
