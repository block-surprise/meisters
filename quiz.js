// テスト用の問題データ（本来はFirestoreから取得）
const quizData = [
    { q: "クリーパーが雷に打たれるとどうなる？", a: ["巨体化する", "帯電クリーパーになる", "消滅する", "分裂する"], correct: 1 },
    { q: "ネザーでベッドを使うとどうなる？", a: ["リスポーン地点になる", "爆発する", "眠れる", "燃える"], correct: 1 },
    { q: "エンドに出現する植物の名前は？", a: ["コーラスプラント", "エンダーフラワー", "紫の木", "奈落草"], correct: 0 }
];

let currentIdx = 0;
let score = 0;

const qText = document.getElementById('question-text');
const optionsArea = document.getElementById('answer-options');
const qNum = document.getElementById('question-number');
const progressBar = document.getElementById('progress-bar');

function loadQuestion() {
    const data = quizData[currentIdx];
    qText.innerText = data.q;
    qNum.innerText = `第 ${currentIdx + 1} 問 / ${quizData.length}`;
    progressBar.style.width = `${(currentIdx / quizData.length) * 100}%`;
    
    optionsArea.innerHTML = "";
    data.a.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.innerText = choice;
        btn.className = "option-btn";
        btn.onclick = () => checkAnswer(i);
        optionsArea.appendChild(btn);
    });
}

function checkAnswer(choiceIdx) {
    if (choiceIdx === quizData[currentIdx].correct) {
        score++;
        // ここに正解時の音やエフェクトを入れると最高
    }
    
    currentIdx++;
    if (currentIdx < quizData.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quiz-container').classList.add('hidden');
    const resultArea = document.getElementById('result-container');
    resultArea.classList.remove('hidden');
    document.getElementById('score-val').innerText = score;
}

loadQuestion();
