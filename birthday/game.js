// === game.js ===============================================================

/* 1. CANVAS --------------------------------------------------------------- */
const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");
function fit(){ canvas.width = innerWidth; canvas.height = innerHeight; }
fit();
addEventListener("resize", () => {
  fit();
  doorX = canvas.width - 120;
  doorY = canvas.height / 2 - 50;
});

/* 2. GÖRSELLER ----------------------------------------------------------- */
const img = s => { const im = new Image(); im.src = s; return im; };

const bg        = img("./assets/forest_big.png");
const p1Img     = img("./assets/player1.png");
const p2Img     = img("./assets/player2.png");
const caveImg   = img("./assets/cave_entrance.png");
const caveSc    = img("./assets/cave_scene.png");
const bearS     = img("./assets/bear_sleeping.png");
const bearA     = img("./assets/bear_angry.png");
const keyImg    = img("./assets/key.png");
const port1     = img("./assets/player1_portrait.png");
const port2     = img("./assets/player2_portrait.png");
const wizardImg = img("./assets/wizard.png");

const p1Side  = img("./assets/player1_side.png");
const p2Side  = img("./assets/player2_side.png");
const wizPort = img("./assets/wizard_portrait.png");
const birthdayImg = img("./assets/birthday.png");
const chestClosedImg = img("./assets/chest_closed.png");
const chestOpenImg = img("./assets/chest_open.png");
const paperImg = img("./assets/paper.png");
const confettiSound = new Audio("./assets/confetti.mp3");
const forestSound = new Audio("./assets/Forest.mp3");
const bearSound = new Audio("./assets/bear.mp3");
const caveSound = new Audio("./assets/Cave.mp3");
const wizardSound = new Audio("./assets/wizard.mp3");
const breakSound = new Audio("./assets/break.mp3");
const melegimSound = new Audio("./assets/melegim.mp3");

/* 3. HARİTA & OYUNCU ------------------------------------------------------ */
const MAP_W = 4690, MAP_H = 4690;
let p1x = 2345, p1y = 2345, speed = 5;
let p2x = 2000, p2y = 2345, p2Visible = false, p2Approach = false;
const caveX = MAP_W - 300, caveY = 50;
let camX = 0, camY = 0;
const clamp = (v, a, b) => Math.max(a, Math.min(v, b));
function camUpdate(){
  camX = clamp(p1x - canvas.width / 2, 0, MAP_W - canvas.width);
  camY = clamp(p1y - canvas.height / 2, 0, MAP_H - canvas.height);
}

/* 4. MAĞARA & WIZARD ODA -------------------------------------------------- */
let inCave = false, c1x = 100, c1y = 100, c2x = 60, c2y = 120;
let doorX = canvas.width - 120, doorY = canvas.height / 2 - 50;
let w1x = 200, w1y = 350;

/* 5. AYI & ANAHTAR -------------------------------------------------------- */
let bearX = 1100, bearY = 450, bearAwake = false, bearT = 0, bearSpd = 3;
let bearDead = false, p2Atk = false;
let keyX = bearX + 115, keyY = bearY + 330, keyVis = true, keyTake = false;

/* 6. FLAĞLAR -------------------------------------------------------------- */
let exitUnlocked = false, gameOver = false, screenShakeDuration = 0, screenShakeIntensity = 5;
let blueLightRadius = 0, blueLightAlpha = 0, blueLightActive = false;
let chestX = 0, chestY = 0, chestOpen = false;
let showPaper = false, paperText = "";

/* 7. DIYALOG -------------------------------------------------------------- */
let phase = "intro", showDlg = true, dlgIdx = 0, charIdx = 0, dlgText = "";
const lines = {
  intro:[{s:"p1",t:"Neredeyim ben?"},{s:"p1",t:"Burası çok sessiz..."},{s:"p1",t:"İleriye doğru gitmeliyim."}],
  approach:[{s:"p1",t:"Sanırım biri daha var..."}],
  meet:[
    {s:"p1",t:"Merhaba! Buraya nasıl geldim neredeyim biliyor musun?"},
    {s:"p2",t:"Merhaba... Ben de neredeyim bilmiyorum."},
    {s:"p1",t:"Ben Duru. Beraber ilerlemek ister misin?"},
    {s:"p2",t:"Elbette! Ben de Eda memnun oldum!"}],
  cave:[
    {s:"p1",t:"Bu da ne böyle?"},{s:"p2",t:"Burası çok karanlık... Dikkatli olmalıyız."},
    {s:"p2",t:"Bak! Ayı orada uyuyor..."},{s:"p2",t:"Diğer tarafa geçmek için onun yanından gitmeliyiz ama sakın ona değme..."},
    {s:"p2",t:"Çok yaklaşmadan ilerleyelim."}],
  bear:[{s:"p1",t:"Aman Tanrım, ayı uyandı AAAAAAA!"},{s:"p2",t:"Seni kurtaracağım!"}],
  afterBear:[{s:"p1",t:"Teşekkür ederim Eda iyi ki buradaydın!"},{s:"p2",t:"Her zaman! Beraber cesur davranmalıyız sen olmasan yapamazdım!"}],
  wizard:[
    {s:"w", t:"GÖRÜYORUM! Demek buraya gelmeyi başardınız..."},
    { s: "w", t: "Engelleri aşıp da buraya ulaşacaklar!" },
    { s: "w", t: "Sisli yazgıdan çıkıp kendi özlerini hatırlayacaklar!" },
    { s: "w", t: "Çözülen kader bağıyla beni sonunda bulacaklar!" },

    {s:"p1",t:"Ne? Bunlar ne demek? Ben kimim ve bu kader de ne?"},
    {s:"p2",t:"Artık buradan çıkmak istiyoruz, lütfen bize yyardım et büyücü!"},
    { s: "w", t: "Her şeyi hatırlayacaksınız!" },
    {s:"p1",t:"AHHHH!"}],

  birthday:[
    {s:"p1",t:"Nereye geldik biz?"},
    {s:"p2",t:"Bir saniye... Bir şeyler hatırlamaya başlıyorum..."},
    {s:"p1",t:"Evet ben de... EDA????"},
    {s:"p2",t:"DURU!!!! Her şeyi hatırlıyorummm."},
    {s:"p1",t:"KANKİMMM BEN DEEE"},
    {s:"p2",t:"Orada bir sandık var, içini açsana."}],

  birthday:[
    {s:"p1",t:"Nereye geldik biz?"},
    {s:"p2",t:"Bir saniye... Bir şeyler hatırlamaya başlıyorum..."},  
    {s:"p1",t:"Evet ben de... EDA????"},
    {s:"p2",t:"DURU!!!! Her şeyi hatırlıyorummm."},
    {s:"p1",t:"KANKİMMM BEN DEEE"},
    {s:"p2",t:"Orada bir sandık var, içini açsana."}]
};
const speaker = () => lines[phase][dlgIdx]?.s ?? "p1";
function updDlg(){
  if(!showDlg) return;
  const L = lines[phase]; if(dlgIdx >= L.length) return;
  const full = L[dlgIdx].t;
  if(charIdx < full.length) dlgText += full[charIdx++];
}
function drawDlg(){
  if(!showDlg) return;
  ctx.fillStyle = "rgba(0,0,0,.7)";
  ctx.fillRect(50, canvas.height - 180, canvas.width - 100, 130);
  const portrait = speaker() === "p1" ? port1 : speaker() === "p2" ? port2 : wizPort;
  ctx.drawImage(portrait, 60, canvas.height - 170, 100, 100);
  ctx.fillStyle = "#fff"; ctx.font = "20px Arial";
  ctx.fillText(dlgText, 180, canvas.height - 120);
}

/* Ayı dialog */
let bearDlgOn=false,bearIdx=0,bearChar=0,bearTxt="",bearT0=0;
function updBearDlg(){
  if(!bearDlgOn) return;
  const L=lines.bear;
  if(bearIdx >= L.length) return;
  const full=L[bearIdx].t;
  if(bearChar < full.length) bearTxt += full[bearChar++];
  else if(bearIdx === 0 && Date.now() - bearT0 > 6000){
    bearIdx = 1; bearChar = 0; bearTxt = "";
  }
}
function drawBearDlg(){
  if(!bearDlgOn || bearIdx >= lines.bear.length) return;
  ctx.fillStyle="rgba(0,0,0,.7)";
  ctx.fillRect(50,40,canvas.width-100,130);
  ctx.drawImage(lines.bear[bearIdx].s==="p1"?port1:port2,60,50,100,100);
  ctx.fillStyle="#fff"; ctx.font="20px Arial";
  ctx.fillText(bearTxt,180,100);
}

/* 8. CONFETTI ------------------------------------------------------------- */
let confetti=[];
function spawnConf(x, y, gray){
  for(let i=0;i<120;i++)
    confetti.push({
      x:x,y:y,dx:(Math.random()-.5)*10,dy:(Math.random()-.5)*10,life:200,
      col:gray?`hsl(0,0%,${30+Math.random()*70}%)`:`hsl(${Math.random()*360},100%,50%)`
    });
}
function drawConf(){
  confetti.forEach(p=>{
    const ox=(inCave||phase==="wizard"||phase==="birthday")?0:camX;
    const oy=(inCave||phase==="wizard"||phase==="birthday")?0:camY;
    ctx.fillStyle=p.col;
    ctx.fillRect(p.x-ox,p.y-oy,8,8);
    p.x+=p.dx; p.y+=p.dy; p.life--;
  });
  confetti=confetti.filter(p=>p.life>0);
}

/* 9. KLAVYE --------------------------------------------------------------- */
const keys={};
addEventListener("keydown",e=>{
  keys[e.key]=true;
  keys[e.code]=true;
  if(e.code==="Space" && showDlg){
    const L=lines[phase];
    if(charIdx<L[dlgIdx].t.length) charIdx=L[dlgIdx].t.length;
    else{
      dlgIdx++;
      if(dlgIdx<L.length){ charIdx=0; dlgText=""; }
      else{
        showDlg=false;
        if(phase==="intro")          phase="overworld";
        else if(phase==="approach"){ phase="meet"; showDlg=true; dlgIdx=charIdx=0; dlgText=""; }
        else if(phase==="meet"){     phase="overworld"; p2Visible=true; p2x = p1x - 120; p2y = p1y; }
        else if(phase==="cave")      phase="caveplay";
        else if(phase==="afterBear"){phase="cavefree"; exitUnlocked=true;}
        else if(phase==="wizard"){
          if (dlgIdx >= lines.wizard.length - 1) {
            screenShakeDuration = 120; // Ekran sallanma süresi
          }
        }
      }
    }
  } else if (e.code === "Space" && phase === "birthday" && !chestOpen) {
    // Oyuncu sandığa yakınsa
    const distToChest = Math.hypot(p1x - chestX, p1y - chestY);
    if (distToChest < 150) { // Yakınlık eşiği
      chestOpen = true;
      spawnConf(chestX + 50, chestY + 50, false); // Renkli konfeti, sandığın ortasından patlasın
      confettiSound.play(); // Konfeti sesini çal
      melegimSound.play(); // Melegim sesini çal
      showPaper = true;
      paperText = "öhöm öhöm şimdi 9-10 yıldır tanışıyoruz.\nSen benim canım kanımsın.\nGerek halay çektik gerek horon teptik.\nHeleleleyyy!\nİyi ki benim bestimsin can dostum.\nİYİ Kİ DOĞDUN KANKİMMMM <3\nNİCE BERABER YILLARIMIZA!!!";
    }
  }
});
addEventListener("keyup",e=>keys[e.key]=false);

/* 10. OYUN DÖNGÜ ---------------------------------------------------------- */
function loop(){
  requestAnimationFrame(loop);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  /* ----- Wizard Oda ----- */
  if(phase==="wizard"){
    if (!forestSound.paused) {
      forestSound.pause();
      forestSound.currentTime = 0;
    }
    if (!caveSound.paused) {
      caveSound.pause();
      caveSound.currentTime = 0;
    }
    if (wizardSound.paused) {
      wizardSound.play();
      wizardSound.loop = true;
    }
    let shakeX = 0, shakeY = 0;
    if (screenShakeDuration > 0) {
      shakeX = (Math.random() - 0.5) * screenShakeIntensity;
      shakeY = (Math.random() - 0.5) * screenShakeIntensity;
      screenShakeDuration--;
    }

    let distortionX = 0, distortionY = 0;
    if (blueLightActive) {
      distortionX = (Math.random() - 0.5) * 5; // Small random offset for breaking effect
      distortionY = (Math.random() - 0.5) * 5;
    }

    ctx.translate(shakeX + distortionX, shakeY + distortionY); // Apply both shake and distortion

    ctx.drawImage(wizardImg,0,0,canvas.width,canvas.height);
    ctx.drawImage(p1Side,w1x,w1y,100,100);
    ctx.drawImage(p2Side,w1x-120,w1y+60,100,100);
    if(keys.ArrowUp)   w1y -= speed;
    if(keys.ArrowDown) w1y += speed;
    if(keys.ArrowLeft) w1x -= speed;
    if(keys.ArrowRight)w1x += speed;
    drawConf();
    updDlg(); drawDlg();

    if (screenShakeDuration <= 0 && phase === "wizard" && !blueLightActive && dlgIdx >= lines.wizard.length) {
      blueLightActive = true;
      screenShakeDuration = 99999; // Set to a very high value for continuous shake
      screenShakeIntensity = 10; // Increase intensity for breaking effect
      if (wizardSound.paused === false) {
        wizardSound.pause();
        wizardSound.currentTime = 0;
      }
      if (breakSound.paused) {
        breakSound.play();
      }
    }

    if (blueLightActive) {
      blueLightRadius += 30; // Işığın büyüme hızı
      blueLightAlpha += 0.02; // Saydamlığın artış hızı
      if (blueLightAlpha > 1) blueLightAlpha = 1;

      // Draw the blue light
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, blueLightRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 255, ${blueLightAlpha})`;
      ctx.fill();

      // Add "breaking" crack-like lines
      if (blueLightRadius > 50) { // Start breaking effect after some initial growth
        for (let i = 0; i < 30; i++) { // Draw more random "cracks"
          const startX = canvas.width / 2 + (Math.random() - 0.5) * blueLightRadius * 0.8;
          const startY = canvas.height / 2 + (Math.random() - 0.5) * blueLightRadius * 0.8;
          const endX = startX + (Math.random() - 0.5) * 100;
          const endY = startY + (Math.random() - 0.5) * 100;

          ctx.strokeStyle = `rgba(255, 255, 255, ${blueLightAlpha * (0.6 + Math.random() * 0.4)})`; // White or light blue cracks, varying opacity
          ctx.lineWidth = 2 + Math.random() * 3;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      if (blueLightRadius > Math.max(canvas.width, canvas.height) * 1.5) { // Changed condition to make it faster
        // Ekran tamamen kaplandığında birthday.png sayfasına geçiş
        phase = "birthday";
        blueLightActive = false;
        blueLightRadius = 0;
        blueLightAlpha = 0;
        chestX = canvas.width / 2 - 50; // Sandığı ekranın ortasına yerleştir
        chestY = canvas.height / 2 + 100; // Sandığı ekranın ortasına yerleştir
        p1x = canvas.width * 0.1; // Oyuncuyu ekranın sol orta kısmına yerleştir
        p1y = canvas.height / 2;
        p2x = p1x - 80; // Player 2'yi Player 1'in yanına yerleştir
        p2y = p1y + 40;
        showDlg = true; dlgIdx = 0; charIdx = 0; dlgText = "";
        if (breakSound.paused === false) {
          breakSound.pause();
          breakSound.currentTime = 0;
        }
      }
    }

    ctx.translate(-(shakeX + distortionX), -(shakeY + distortionY)); // Reset translation

    return;
  }

  /* ----- Birthday Ekranı ----- */
  if(phase==="birthday"){
    if (!forestSound.paused) {
      forestSound.pause();
      forestSound.currentTime = 0;
    }
    if (!caveSound.paused) {
      caveSound.pause();
      caveSound.currentTime = 0;
    }
    if (!wizardSound.paused) {
      wizardSound.pause();
      wizardSound.currentTime = 0;
    }
    if (!bearSound.paused) {
      bearSound.pause();
      bearSound.currentTime = 0;
    }
    if (!breakSound.paused) {
      breakSound.pause();
      breakSound.currentTime = 0;
    }
    ctx.drawImage(birthdayImg, 0, 0, canvas.width, canvas.height);

    // Sandığı çiz
    if (!chestOpen) {
      ctx.drawImage(chestClosedImg, chestX, chestY, 100, 100);
    } else {
      ctx.drawImage(chestOpenImg, chestX, chestY, 100, 100);
    }

    // Oyuncuyu çiz (geçici olarak, konumlandırma için)
    ctx.drawImage(p1Img, p1x, p1y, 100, 100);
    ctx.drawImage(p2Img, p2x, p2y, 100, 100);

    // Konfeti çiz
    drawConf();

    // Oyuncu hareketini sağla
    if(!showPaper && !showDlg){
      if(keys.ArrowUp)    p1y -= speed;
      if(keys.ArrowDown)  p1y += speed;
      if(keys.ArrowLeft)  p1x -= speed;
      if(keys.ArrowRight) p1x += speed;
      p2x = p1x - 80; p2y = p1y + 40;
    }

    // Pop-up'ı çiz
    if (showPaper) {
      ctx.drawImage(paperImg, canvas.width / 2 - 300, canvas.height / 2 - 500, 600, 1000);
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";      ctx.textAlign = "center";      const lines = paperText.split('\n');      for (let i = 0; i < lines.length; i++) {        ctx.fillText(lines[i], canvas.width / 2, canvas.height / 2 - 150 + i * 20);      }
    }

    updDlg();
    drawDlg();

    return;
  }

  /* ----- Overworld ----- */
  if(!inCave){
    camUpdate();
    ctx.drawImage(bg,camX,camY,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
    ctx.drawImage(p1Img,p1x-camX,p1y-camY,100,100);

    ctx.drawImage(caveImg,caveX-camX,caveY-camY,140,140);

    if(!showDlg){
      if(keys.ArrowUp)    p1y -= speed;
      if(keys.ArrowDown)  p1y += speed;
      if(keys.ArrowLeft)  p1x -= speed;
      if(keys.ArrowRight) p1x += speed;
    }

    if(!p2Approach && !p2Visible && p1x>2450) p2Approach=true;

    if(p2Approach){
      p2x += 3.5;
      ctx.drawImage(p2Img,p2x-camX,p2y-camY,100,100);
      if(p2x >= p1x-100){
        p2Approach=false; p2Visible=true;
        phase="approach"; showDlg=true; dlgIdx=charIdx=0; dlgText="";
      }
    }else if(p2Visible){
      ctx.drawImage(p2Img,p1x-120-camX,p1y-camY,100,100);
    }

    if(phase==="overworld" && p1x>caveX-40 && p1x<caveX+100 && p1y<caveY+120){
      inCave=true; phase="cave"; showDlg=true; dlgIdx=charIdx=0; dlgText="";
      doorX = canvas.width - 120;
      doorY = canvas.height / 2 - 50;
    }

    drawConf(); updDlg(); drawDlg();
    return;
  }

  /* ----- Cave ----- */
  if (forestSound.paused === false) {
    forestSound.pause();
    forestSound.currentTime = 0;
  }
  if (caveSound.paused === true) {
    caveSound.play();
  }
  ctx.drawImage(caveSc,0,0,canvas.width,canvas.height);
  ctx.drawImage(p1Img,c1x,c1y,100,100);
  ctx.drawImage(p2Img,c2x,c2y,100,100);

  /* Kapıya geçiş */
  if (phase === "cavefree" && exitUnlocked && c1x > canvas.width - 150) {
    phase="wizard"; inCave=false;
    showDlg=true; dlgIdx=charIdx=0; dlgText="";
    p1x = canvas.width * 0.1; p1y = canvas.height / 2; p2x = p1x - 120; p2y = p1y + 60; w1x = p1x; w1y = p1y;
    if (caveSound.paused === false) {
      caveSound.pause();
      caveSound.currentTime = 0;
    }
    return;
  }

  /* Mağara diyalogları */
  if(phase==="cave"){ updDlg(); drawDlg(); if(!showDlg) phase="caveplay"; }
  if(phase==="afterBear"){ updDlg(); drawDlg(); }

  /* Anahtar */
  if(!bearAwake && keyVis) ctx.drawImage(keyImg,keyX,keyY,140,140);
  if(!keyTake && Math.hypot(c1x-keyX,c1y-keyY)<60){ keyTake=true; keyVis=false; }

  /* Ayı */
  if(!bearDead){
    if(bearAwake){
      ctx.drawImage(bearA,bearX,bearY,350,350);
      const dx=c1x-bearX,dy=c1y-bearY,d=Math.hypot(dx,dy);
      if(d>1){ bearX+=dx/d*bearSpd; bearY+=dy/d*bearSpd; }
      if(Date.now()-bearT>11000 && !p2Atk) p2Atk=true;
      if(p2Atk){
        const dx2=bearX-c2x,dy2=bearY-c2y,d2=Math.hypot(dx2,dy2);
        if(d2>2){ c2x+=dx2/d2*speed; c2y+=dy2/d2*speed; }
        else{
          bearDead=true; exitUnlocked=true; spawnConf(bearX + 175, bearY + 175, true);
          bearDlgOn=false; bearTxt="";
          bearSound.pause();
          bearSound.currentTime = 0;
          phase="afterBear"; showDlg=true; dlgIdx=charIdx=0; dlgText="";
          p2Atk = false;
        }
      }
      if(Math.hypot(c1x-bearX,c1y-bearY)<50) gameOver=true;
    }else{
      ctx.drawImage(bearS,bearX,bearY,350,350);
      if(Math.hypot(c1x-bearX,c1y-bearY)<300){
        bearAwake=true; bearT=Date.now(); bearDlgOn=true; bearT0=Date.now();
        bearSound.play();
      }
    }
  }else exitUnlocked=true;

  /* Hareket */
  if(!showDlg && ["caveplay","afterBear","cavefree"].includes(phase)){
    if(keys.ArrowUp)    c1y -= speed;
    if(keys.ArrowDown)  c1y += speed;
    if(keys.ArrowLeft)  c1x -= speed;
    if(keys.ArrowRight) c1x += speed;
    if(!p2Atk){ c2x = c1x - 80; c2y = c1y + 40; }
  }

  drawConf(); updBearDlg(); drawBearDlg();

  if(gameOver){
    ctx.fillStyle="red"; ctx.font="60px Arial"; ctx.textAlign="center";
    ctx.fillText("GAME OVER",canvas.width/2,canvas.height/2);
  }
}

const startButton = document.getElementById("startButton");
const startScreen = document.getElementById("startScreen");

startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  forestSound.play();
  forestSound.loop = true;
  loop();
});
