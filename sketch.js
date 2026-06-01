// ========================================================
// [전역 변수 설정] 게임 시스템 통합 관리 주머니
// ========================================================
let stats = { 
  테토력: 0, 
  에겐력: 0, 
  정떨: 0 
}; 

let currentStage = 1; 
let scenarioStep = 0;      
let isShowingResult = false; 
let resultMsg = "";        
let currentOptions = [];   

let choiceButtons = [];
let nextActionButton;
let finalizeBtn = null; 

let imgEgen, imgTeto, imgJung;
let endingImg = null;
let maxStatResult = "";

let textBoxY = 65;
let textBoxH = 260;

// ========================================================
// ⏳ [Preload] 이미지 자원 미리 불러오기
// ========================================================
function preload() {
  try {
    imgEgen = loadImage('ending_egen.png');
    imgTeto = loadImage('ending_teto.png');
    imgJung = loadImage('jingjing2.png');
  } catch (e) {
    console.log("이미지 로드 실패 또는 경로 확인 필요");
  }
}

// ========================================================
// ⚙️ [Setup] 모바일 반응형 캔버스 및 버튼 생성
// ========================================================
function setup() {
  let canvasWidth = min(windowWidth, 600);
  
  // 🛠️ 수정: 캔버스를 전용 홀더인 #canvas-holder 내부에 넣습니다.
  let myCanvas = createCanvas(canvasWidth, 600); 
  myCanvas.parent('canvas-holder');
  
  let canvasElement = document.getElementById('defaultCanvas0');
  if (canvasElement) {
    canvasElement.style.touchAction = 'none';
  }
  
  // 선택지용 html 버튼 3개 동적 생성 및 하단 버튼 컨테이너로 귀속
  for (let i = 0; i < 3; i++) {
    let btn = createButton('');
    btn.parent('button-container'); 
    btn.hide(); 
    choiceButtons.push(btn);
  }
  
  // 마일스톤(다음 이야기 진행하기) 버튼 생성
  nextActionButton = createButton('▶ 다음 이야기 진행하기');
  nextActionButton.parent('button-container'); 
  nextActionButton.class('action-btn'); 
  
  nextActionButton.mousePressed((e) => {
    if(e) e.stopPropagation();
    moveToNextStep();
  });
  nextActionButton.hide();

  loadStageScenario();
}

// ========================================================
// 🎨 [Draw] 화면 크기에 맞춰 동적 UI 레이아웃 드로잉
// ========================================================
function draw() {
  background('#1a1a2e'); 
  
  drawTopStatsBar();
  
  fill('#0f172a');
  stroke('#000000');
  strokeWeight(1);
  
  if (currentStage === 5 && scenarioStep === 1) {
    textBoxH = 120;
    rect(15, textBoxY, width - 30, textBoxH, 5);
  } else {
    textBoxH = 260;
    rect(15, textBoxY, width - 30, textBoxH, 5);
  }
  
  noStroke();
  fill('#ffffff');
  textAlign(LEFT, TOP);
  
  if (isShowingResult) {
    textSize(14);
    if (currentStage === 5) {
      text(`${resultMsg}\n\n[최종 스탯: 에겐 ${stats.에겐력} / 테토 ${stats.테토력} / 정떨 ${stats.정떨}]`, 30, textBoxY + 15, width - 60, textBoxH - 20);
      
      if (endingImg) {
        imageMode(CENTER);
        let imgW = min(400, width - 40); 
        let imgH = imgW * (300 / 400);   
        let imgY = textBoxY + textBoxH + 15 + (imgH / 2);
        image(endingImg, width / 2, imgY, imgW, imgH); 
      } else {
        fill('#ffffff');
        textAlign(CENTER, CENTER);
        text(`[${maxStatResult} 일러스트 공간]`, width / 2, 350);
      }
    } else {
      text(resultMsg, 30, textBoxY + 20, width - 60, textBoxH - 40);
    }
  } else {
    textSize(14);
    let displayPrompt = getStagePromptText();
    text(displayPrompt, 30, textBoxY + 20, width - 60, textBoxH - 40);
  }
}

function drawTopStatsBar() {
  fill('#16213e');
  stroke('#ffffff');
  strokeWeight(1);
  rect(15, 10, width - 30, 40, 5);
  
  noStroke();
  fill('#ffffff');
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`🧸테토: ${stats.테토력} | 🦊에겐: ${stats.에겐력} | 💔정떨: ${stats.정떨}`, width / 2, 30);
}

function getStagePromptText() {
  if (currentStage === 1) {
    if (scenarioStep === 0) {
      return "💌 [SYSTEM]: 띠링! 새로운 메시지가 도착했습니다.\n💬 친구: '야, 내가 진짜 괜찮은 애 엄선해서 소개해주는 거니까 매너 알지? 잘해봐!!'\n\n오늘은 드디어 친구가 침이 마르도록 칭찬하며 소개해준 '그'를 만나러 가는 날!\n\n(화면 중앙의 텍스트 박스 안쪽을 터치하면 대화가 시작됩니다.)";
    } else if (scenarioStep === 1) {
      return "📍 [상황 1: 외형 결정]\n\n‘멀리서 걸어오는 저 애가 오늘 만나기로 한 애인가? 스타일이…’";
    } else if (scenarioStep === 2) {
      return "📍 [상황 2: 상대가 10분 늦었을 때]\n\n상대방이 뛰어오며 하는 첫마디는?";
    } else if (scenarioStep === 3) {
      return "📍 [상황 3: 데이트 스타일]\n\n'오늘 날씨 좋다! 뭐 하고 싶어?'";
    }
  }
  else if (currentStage === 2) {
    if (scenarioStep === 4) {
      return "📍 [상황 4] 메뉴 선택\n\n드디어 점심시간!\n뭐 먹을지 정하는데... 그 애의 태도가 심상치 않다.\n오늘 점심, 어떻게 흘러갈까?";
    } else if (scenarioStep === 5) {
      return "📍 [상황 5] 하교 버스\n\n수업 끝나고 버스를 탔다.\n옆자리에 앉은 그 애... 곧 나는 졸기 시작했고,\n어느 순간 머리가 그 애 어깨에 기대버렸다.\n그 애의 반응은?";
    } else if (scenarioStep === 6) {
      return "📍 [상황 6] 감성 카페\n\n인스타 핫플 카페에 왔다!\n각자 다른 음료를 시켰는데...\n그 애가 한 모금 마시더니 눈이 반짝인다.\n다음 행동은?";
    }
  }
  else if (currentStage === 3) {
    if (scenarioStep === 7) {
      return "📍 [상황 7] 술자리 옆자리\n\n시끌벅적한 동아리 술자리, 정신을 차려보니 그 애가 바로 옆자리에 앉아있다. 하필 상대방이 술게임에 걸려 무척 곤란해하고 있는 상황! 당신의 선택은?";
    } else if (scenarioStep === 8) {
      return "📍 [상황 8] 단둘이 방안\n\n술자리가 무르익고, 다들 바람을 쐬러 나가며 방 안에는 단둘만 남게 되었다. 애매하게 가까워진 거리감, 어색하면서도 심장이 터질 것 같은 이 순간 당신은?";
    } else if (scenarioStep === 9) {
      return "📍 [상황 9] 새벽 통화\n\n술자리가 끝나고 집에 돌아와 침대에 무기력하게 누운 새벽 1시. 지잉- 진동과 함께 그 사람에게서 온 뜻밖의 메시지: \"잠깐 통화할래?\" 당신의 답변은?";
    }
  }
  else if (currentStage === 4) {
    if (scenarioStep === 10) {
      return "📍 [상황 10] 비 오는 날\n\n갑자기 하늘이 무너지듯 비가 쏟아진다. 우산도 없이 다 같이 택시를 잡아야 하는 상황! 그 애가 비를 맞고 있다. 당신의 선택은?";
    } else if (scenarioStep === 11) {
      return "📍 [상황 11] 대학 축제\n\n축제 인파가 장난이 아니다. 사람들이 밀려오면서 그 애가 계속 치인다. 나는 어떻게 할까?";
    } else if (scenarioStep === 12) {
      return "📍 [상황 12] 취중 전화\n\n2차까지 달린 결과... 나 지금 꽤 취했다. 손이 먼저 움직여 그 애한테 전화를 걸었다. 뚜루루루- 연결됐다. '...응?' 당신의 답변은?";
    }
  }
  else if (currentStage === 5) {
    if (scenarioStep === 0) {
      return "📍 마지막 고백\n\n함께 한적한 공원을 걸으며 어색한 분위기가 감돈다. 침묵을 깨고 그가 나직이 말한다.\n\n\"있잖아...\"\n\n(텍스트 박스 영역을 터치하여 최종 대답을 확인하세요!)";
    }
  }
  return "";
}

function loadStageScenario() {
  isShowingResult = false;
  nextActionButton.hide();
  
  for (let btn of choiceButtons) btn.hide();
  
  if (currentStage === 1) {
    if (scenarioStep === 0) return; 
    else if (scenarioStep === 1) {
      currentOptions = [
        ["깔끔하고 댄디한 화이트 셔츠", "에겐", 10],
        ["편안하고 스포티한 트레이닝복", "테토", 10],
        ["눈이 부시는 번쩍번쩍 은갈치룩", "정떨", 10]
      ];
    } else if (scenarioStep === 2) {
      currentOptions = [
        ["'미안해, 꽃 고르다가 늦었어!'", "에겐", 10],
        ["'차가 막혔어, 어디 갈래?'", "테토", 20], 
        ["'10분가지고 째째하게 왜 그래?'", "정떨", 10]
      ];
    } else if (scenarioStep === 3) {
      currentOptions = [
        ["분위기 좋은 카페 가기", "에겐", 10],
        ["클라이밍 하고 고기 먹기", "테토", 10],
        ["PC방 가자", "정떨", 10]
      ];
    }
  }
  else if (currentStage === 2) {
    if (scenarioStep === 4) {
      currentOptions = [
        ["맛집 리스트를 보여준다 ('어떤 거 좋아해?')", "에겐", 20],
        ["앞장서서 식당을 정한다 ('저기 가자')", "테토", 20],
        ["아무 데나 들어간다 ('그냥 아무 거나 먹자' 쩝쩝)", "정떨", 20]
      ];
    } else if (scenarioStep === 5) {
      currentOptions = [
        ["얼굴이 빨개져서 꼼짝도 않고 굳어버린다", "에겐", 20],
        ["살짝 자세를 고쳐 어깨를 내어준다 ('...편하게 자.')", "테토", 20],
        ["머리를 살짝 밀어낸다 ('무거워.')", "정떨", 20]
      ];
    } else if (scenarioStep === 6) {
      currentOptions = [
        ["뚜껑을 열어 건넨다 ('맛있다, 너도 먹어볼래?')", "에겐", 30],
        ["그냥 쭉 내밀며 말한다 ('맛있네. 먹어봐')", "테토", 30],
        ["갑자기 엉뚱한 질문을 던진다 ('근데 너 혈액형이 뭐야?')", "정떨", 30]
      ];
    }
  }
  else if (currentStage === 3) {
    if (scenarioStep === 7) {
      currentOptions = [
        ["\"내가 대신 마신다!\" 흑기사/흑장미를 자처해 마신다.", "에겐", 20],
        ["\"너 속 버려.\" 조용히 안주를 숟가락에 얹어 챙겨준다.", "테토", 20],
        ["\"아, 나 화장실 좀...\" 슬그머니 다른 테이블로 도망친다.", "정떨", 20]
      ];
    } else if (scenarioStep === 8) {
      currentOptions = [
        ["지그시 상대방의 눈을 맞추며, 자연스럽게 조금 더 가까이 앉는다.", "에겐", 25],
        ["\"야, 우리 이거 다 먹어치우자ㅋㅋ\" 장난치며 분위기를 푼다.", "테토", 25],
        ["로봇처럼 굳어버려 핸드폰만 만지며 침묵을 유지한다.", "정떨", 25]
      ];
    } else if (scenarioStep === 9) {
      currentOptions = [
        ["\"응! 마침 네 생각 하면서 기다렸어.\" 바로 전화를 건다.", "에겐", 30],
        ["\"좋지 전화해~ 대답 잘 안 하면 졸고 있는 거임ㅋㅋ\"", "테토", 30],
        ["\"나 내일 1교시라 피곤한데... 급한 일이야?\" 선을 긋는다.", "정떨", 40]
      ];
    }
  }
  else if (currentStage === 4) {
    if (scenarioStep === 10) {
      currentOptions = [
        ["슬쩍 우산을 건넨다 ('나 괜찮으니까 이거 써.')", "에겐", 20],
        ["우산을 같이 씌워준다 ('이리 와, 같이 써.')", "테토", 20],
        ["먼저 혼자 택시를 탄다 ('택시 잡았다! 먼저 갈게~')", "정떨", 20]
      ];
    } else if (scenarioStep === 11) {
      currentOptions = [
        ["아무 말 없이 뒤에서 양팔로 공간을 만들어준다.", "에겐", 25],
        ["손목을 잡고 야광팔찌를 채워준다.", "테토", 25],
        ["혼자 휙휙 앞서 간다 ('빨리 와! 저기 자리 있다!')", "정떨", 25]
      ];
    } else if (scenarioStep === 12) {
      currentOptions = [
        ["'초코우유 사 들고 통화할게, 잠깐만' (편의점으로 질주)", "에겐", 30],
        ["'나 지금 데리러 갈게' (취한 채로 출동 선언)", "테토", 30],
        ["'...아무것도 아냐. 곱게 집이나 들어가.' (뚝)", "정떨", 40]
      ];
    }
  }

  if (currentStage === 5) return;

  shuffle(currentOptions, true);

  // 버튼들이 HTML 구조 속에서 자연스럽게 노출되므로 순서 꼬임 방지됨
  for (let i = 0; i < 3; i++) {
    choiceButtons[i].html(`${i + 1}. ${currentOptions[i][0]}`);
    choiceButtons[i].mousePressed((e) => {
      if(e) e.stopPropagation(); 
      handleOptionSelect(i);
    });
    choiceButtons[i].show();
  }
}

function handleOptionSelect(index) {
  let chosenData = currentOptions[index];
  let type = chosenData[1];
  let scoreValue = chosenData[2];

  if (currentStage === 1) {
    if (type === "에겐") { stats.에겐력 += scoreValue; resultMsg = `💬 [선택 결과]\n\n상대의 다정한 면모가 마음에 쏙 들었다! 분위기가 몽글몽글해진다.`; }
    else if (type === "테토") { stats.테토력 += scoreValue; resultMsg = `💬 [선택 결과]\n\n활기차고 든든한 모습에 자연스레 긴장이 풀리며 웃음이 터졌다.`; }
    else if (type === "정떨") { stats.정떨 += scoreValue; resultMsg = `💬 [선택 결과]\n\n순간 정적이 흘렀다... 머릿속으로 친구 번호를 찾아보게 된다.`; }
    
    if (scenarioStep === 3) {
      scenarioStep = 4; 
    } else {
      scenarioStep++; 
    }
  } 
  else if (currentStage === 2) {
    if (scenarioStep === 4) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n맛집 리스트를 보여주며 취향을 물어봤다.\n그 애, 괜히 신중하게 골라주며 살짝 웃는다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n망설임 없이 앞장서서 식당을 정해버렸다.\n결과는? 대성공 맛집이었다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n아무 데나 들어가 메뉴판도 안 보고 시켰다.\n나: (입에 가득 넣고) '쩝쩝... 뭐 먹히네'"; stats.정떨 += scoreValue; }
      scenarioStep = 5;
    } else if (scenarioStep === 5) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n심장이 쿵 내려앉았지만 귀까지 빨개진 채 굳어버렸다.\n그 애는 모르는 척 창문만 바라본다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n살며시 자세를 바로잡고 어깨를 내어줬다.\n그 애, 내 어깨 위에서 미동도 없이 편하게 잠들었다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n'무거워.'라며 밀어냈다. 잠에서 깬 그 애, 상황 파악하고 얼굴이 새빨개진다."; stats.정떨 += scoreValue; }
      scenarioStep = 6;
    } else if (scenarioStep === 6) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n'맛있다, 너도 먹어볼래?'하며 건넸다.\n그 애, 한 모금 마시더니 눈을 반짝인다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n'맛있네. 먹어봐, 입 대도 돼.'\n그 애, 잠깐 머뭇거리더니 천천히 한 모금 마셨다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n'근데 너 혈액형이 뭐야?'\n카페 분위기는 사라지고 어색한 과학 토크가 시작됐다."; stats.정떨 += scoreValue; }
      scenarioStep = 7;
    }
  }
  else if (currentStage === 3) {
    if (scenarioStep === 7) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n흑기사/흑장미를 자처해 잔을 비웠다!\n그 애가 고마움과 미안함이 섞인 눈빛으로 바라본다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n조용히 안주를 수저에 얹어주었다.\n그 애는 감동받은 표정으로 내심 든든해하는 눈치다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n슬그머니 자리를 피해버렸다.\n돌아와 보니 그 애는 억지로 술을 다 마시고 지쳐있다."; stats.정떨 += scoreValue; }
      scenarioStep = 8;
    } else if (scenarioStep === 8) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n지그시 눈을 맞추며 한 걸음 가까이 앉았다.\n방 안의 공기가 순식간에 멜로 영화처럼 텐션이 올라간다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n장난을 치며 분위기를 풀었다.\n그 애가 빵 터지며 한층 더 편안하고 친밀한 대화가 이어졌다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n로봇처럼 굳어 핸드폰만 보았다.\n방 안에 째깍거리는 시계 소리만 가득했고 분위기는 식었다."; stats.정떨 += scoreValue; }
      scenarioStep = 9;
    } else if (scenarioStep === 9) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n\"네 생각 하면서 기다렸어.\" 바로 전화를 건다.\n수화기 너머로 그 애의 수줍은 웃음소리가 흘러나온다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n새벽 내내 끊이지 않는 스몰 토크와 티키타카 속에서 서로에게 깊이 빠져들었다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n\"나 내일 1교시라 피곤한데...\" 철벽을 쳤다.\n\"아냐 자라!\"라는 짧은 톡을 끝으로 대화가 끝났다."; stats.정떨 += scoreValue; }
      scenarioStep = 10;
    }
  }
  else if (currentStage === 4) {
    if (scenarioStep === 10) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n우산을 슬쩍 건넸다. 수줍지만 따뜻한 배려가 마음에 닿았다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n옆에 서서 우산을 같이 씌워준다. 좁은 우산 아래 어깨가 닿을 듯 말 듯 분위기가 묘해진다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n혼자 택시에 올라탔다. 뒤돌아보니 그 애, 비 맞으며 멍하니 서 있다."; stats.정떨 += scoreValue; }
      scenarioStep = 11;
    } else if (scenarioStep === 11) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n아무 말 없이 뒤에서 양팔로 공간을 방어해준다. 말 없는 배려가 더 크게 느껴지는 순간이다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n손목을 잡고 야광팔찌를 채워준다. 그 애, 팔찌 낀 손목을 보며 수줍게 웃는다."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n인파를 헤치며 혼자 나아갔다. 뒤돌아보니 그 애가 인파 속에서 사라졌다."; stats.정떨 += scoreValue; }
      scenarioStep = 12;
    } else if (scenarioStep === 12) {
      if (type === "에겐") { resultMsg = "💬 [선택 결과]\n\n초코우유를 사 들고 벤치에 앉아 통화를 이어갔다. 달콤한 웃음이 가득하다."; stats.에겐력 += scoreValue; }
      if (type === "테토") { resultMsg = "💬 [선택 결과]\n\n'주소 보내. 지금 바로 간다.' 취했어도 걱정이 앞서는 직진남."; stats.테토력 += scoreValue; }
      if (type === "정떨") { resultMsg = "💬 [선택 결과]\n\n전화를 뚝 끊어버렸다. 다음 날 카톡이 온다. '어젠 왜 전화했어?'"; stats.정떨 += scoreValue; }
      scenarioStep = 13;
    }
  }

  isShowingResult = true;
  for (let btn of choiceButtons) btn.hide(); 
  
  nextActionButton.show();
}

function moveToNextStep() {
  nextActionButton.hide();
  
  if (currentStage === 1 && scenarioStep === 4) {
    alert(`🎉 [1단계 종료] 현재 누적 점수\n🧸 테토력: ${stats.테토력} | 🦊 에겐력: ${stats.에겐력} | 💔 정떨: ${stats.정떨}`);
    currentStage = 2; scenarioStep = 4;
  } 
  else if (currentStage === 2 && scenarioStep === 7) {
    alert(`🎉 [2단계 종료] 현재 누적 점수\n🧸 테토력: ${stats.테토력} | 🦊 에겐력: ${stats.에겐력} | 💔 정떨: ${stats.정떨}`);
    currentStage = 3; scenarioStep = 7;
  }
  else if (currentStage === 3 && scenarioStep === 10) {
    alert(`🎉 [3단계 종료] 현재 누적 점수\n🧸 테토력: ${stats.테토력} | 🦊 에겐력: ${stats.에겐력} | 💔 정떨: ${stats.정떨}`);
    currentStage = 4; scenarioStep = 10;
  }
  else if (currentStage === 4 && scenarioStep === 13) {
    alert(`🎉 [4단계 종료] 마지막 고백 단계로 넘어갑니다!`);
    currentStage = 5; scenarioStep = 0;
  }

  loadStageScenario();
}

function mousePressed() {
  if (mouseX > 15 && mouseX < width - 15 && mouseY > textBoxY && mouseY < textBoxY + textBoxH) {
    
    if (currentStage === 1 && scenarioStep === 0) {
      scenarioStep = 1;
      loadStageScenario();
    }
    else if (currentStage === 5 && scenarioStep === 0) {
      scenarioStep = 1;
      isShowingResult = true;
      
      let maxKey = "에겐력";
      if (stats["테토력"] > stats[maxKey]) maxKey = "테토력";
      if (stats["정떨"] > stats[maxKey]) maxKey = "정떨";
      
      maxStatResult = maxKey;
      
      if (maxKey === "에겐력") {
        resultMsg = "💖 [에겐 고백]\n\n(떨리는 손으로 작은 선물을 내밀며 고개를 숙인 채)\n더 이상 친구로만 지내는 건 못 하겠어. 너를 아주 많이 좋아해.";
        endingImg = imgEgen;
      } else if (maxKey === "테토력") {
        resultMsg = "🌱 [테토 고백]\n\n(먼 곳을 응시하며 툭 내뱉듯이)\n나랑 사귀자. 잘해줄게.";
        endingImg = imgTeto;
      } else {
        resultMsg = "💥 [정떨 고백]\n\n(울먹이며)\n나랑 사ꈈ 거야 말 거야? 대답 안 해? 너 내가 찬 거다?";
        endingImg = imgJung;
      }
      
      if (!finalizeBtn) {
        finalizeBtn = createButton('게임 완전히 처음부터 다시하기');
        finalizeBtn.parent('button-container'); 
        finalizeBtn.class('action-btn');
        finalizeBtn.mousePressed((e) => {
          if(e) e.stopPropagation();
          window.location.reload();
        });
      }
      finalizeBtn.show();
    }
  }
}
