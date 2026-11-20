import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// --- Firebase設定（common.jsと同じもの） ---
const firebaseConfig = {
    apiKey: "AIzaSyBz-HV0B2bkcwXb7Lv2gtQsqX-ldvb9NO0",
    authDomain: "sentence-checker-1595d.firebaseapp.com",
    projectId: "sentence-checker-1595d",
    storageBucket: "sentence-checker-1595d.firebasestorage.app",
    messagingSenderId: "987027897244",
    appId: "1:987027897244:web:c80cba1feb361e41692659"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- ランク定義（累計正解数。common.js / mypage.js と共通の基準） ---
const RANK_LADDER = [
    { name: "ネザライト", min: 120 },
    { name: "ダイヤモンド", min: 80 },
    { name: "ゴールド", min: 50 },
    { name: "アイアン", min: 20 },
    { name: "ストーン", min: 1 },
    { name: "未受検", min: 0 }
];

function rankFromTotal(total) {
    for (const r of RANK_LADDER) {
        if (total >= r.min) return r.name;
    }
    return "未受検";
}

const PASS_SCORE_RATIO = 0.7; // 70%以上で合格（バッジ付与）

// 状態管理変数
let quizData = [];
let currentIndex = 0;
let score = 0;
let answered = false;

// URLからレベルを取得 (?level=beginner など)
const urlParams = new URLSearchParams(window.location.search);
const currentLevel = urlParams.get('level') || 'beginner';

const LEVEL_NAMES = {
    beginner: "初級検定",
    intermediate: "中級検定",
    advanced: "上級検定"
};

// テンプレート問題や重複を除く
function cleanQuestions(docs) {
    const seen = new Set();
    const cleaned = [];
    for (const data of docs) {
        if (!data || typeof data.question !== "string") continue;
        const q = data.question.trim();
        if (!q || q === "問題文") continue; // テンプレートの残骸を除外
        if (!Array.isArray(data.options) || data.options.length < 2) continue;
        if (data.options.join(",") === "A,B,C,D") continue;
        if (typeof data.answerIndex !== "number" || data.answerIndex < 0 || data.answerIndex >= data.options.length) continue;
        if (seen.has(q)) continue; // 重複登録された問題は1回だけ
        seen.add(q);
        cleaned.push(data);
    }
    return cleaned;
}

// 1. 問題を読み込む
async function loadQuizzes() {
    try {
        const q = query(
            collection(db, "quizzes"),
            where("level", "==", currentLevel)
        );
        const snapshot = await getDocs(q);
        quizData = cleanQuestions(snapshot.docs.map(doc => doc.data()));

        if (quizData.length === 0) {
            document.getElementById('question-text').innerText = "このレベルの問題はまだ登録されていません。";
            document.getElementById('question-number').innerText = LEVEL_NAMES[currentLevel] || "";
            return;
        }

        // シャッフルして最大10問
        quizData = quizData.sort(() => Math.random() - 0.5).slice(0, 10);
        showQuestion();
    } catch (e) {
        console.error("読み込みエラー:", e);
        document.getElementById('question-text').innerText = "問題データにアクセスできませんでした。通信環境を確認して、もう一度開いてください。";
    }
}

// 2. 問題を表示する
function showQuestion() {
    answered = false;
    const question = quizData[currentIndex];
    document.getElementById('question-text').innerText = question.question;
    document.getElementById('question-number').innerText = `第 ${currentIndex + 1} 問 / ${quizData.length}`;

    const feedback = document.getElementById('feedback');
    if (feedback) feedback.classList.add('hidden');

    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = "";

    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });

    // プログレスバー更新
    const progress = (currentIndex / quizData.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// 3. 正誤判定（その場でフィードバックを出す）
function checkAnswer(choice, chosenBtn) {
    if (answered) return;
    answered = true;

    const question = quizData[currentIndex];
    const isCorrect = choice === question.answerIndex;
    if (isCorrect) score++;

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.answerIndex) btn.classList.add('correct');
    });
    if (!isCorrect && chosenBtn) chosenBtn.classList.add('wrong');

    const feedback = document.getElementById('feedback');
    const feedbackText = document.getElementById('feedback-text');
    const nextBtn = document.getElementById('next-btn');
    if (feedback && feedbackText && nextBtn) {
        feedbackText.innerText = isCorrect
            ? "⭕ 正解！"
            : `❌ 不正解… 正解は「${question.options[question.answerIndex]}」`;
        feedbackText.className = isCorrect ? "feedback-correct" : "feedback-wrong";
        nextBtn.innerText = currentIndex + 1 < quizData.length ? "次の問題へ" : "結果を見る";
        feedback.classList.remove('hidden');
    } else {
        // フィードバック要素がない場合は従来通りすぐ進む
        goNext();
    }
}

function goNext() {
    currentIndex++;
    if (currentIndex < quizData.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

const nextBtnEl = document.getElementById('next-btn');
if (nextBtnEl) nextBtnEl.addEventListener('click', goNext);

// 4. 終了処理
async function finishQuiz() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');
    document.getElementById('score-val').innerText = score;
    const totalEl = document.getElementById('total-val');
    if (totalEl) totalEl.innerText = quizData.length;
    document.getElementById('progress-bar').style.width = `100%`;

    const passed = quizData.length > 0 && (score / quizData.length) >= PASS_SCORE_RATIO;
    const passEl = document.getElementById('result-pass-msg');
    if (passEl) {
        passEl.innerText = passed
            ? `🎉 ${LEVEL_NAMES[currentLevel] || "検定"} 合格！マイページにバッジが付きました`
            : `あと少し！合格は ${Math.ceil(quizData.length * PASS_SCORE_RATIO)} 問以上の正解です`;
        passEl.className = passed ? "pass-msg pass" : "pass-msg fail";
    }

    document.getElementById('result-rank-msg').innerText = "記録を保存しています…";
    const saved = await saveResult(score, passed);
    if (saved) {
        document.getElementById('result-rank-msg').innerText =
            `累計 ${saved.total} 問正解！現在のランクは「${saved.rank}」です`;
    } else {
        document.getElementById('result-rank-msg').innerText = "";
    }
}

// 結果を保存する（累計正解数に加算し、合格したレベルを記録する）
async function saveResult(score, passed) {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        const prev = docSnap.exists() ? docSnap.data() : {};

        const total = (prev.totalCorrect || 0) + score;
        const clearedLevels = { ...(prev.clearedLevels || {}) };
        if (passed) clearedLevels[currentLevel] = true;

        const name = user.displayName || (user.email ? user.email.split("@")[0] : "名無しのマイスター");

        await setDoc(userRef, {
            totalCorrect: total,
            bestScore: Math.max(prev.bestScore || 0, score),
            plays: (prev.plays || 0) + 1,
            clearedLevels: clearedLevels,
            displayName: name,
            lastPlayed: new Date(),
            rank: rankFromTotal(total)
        }, { merge: true });

        return { total, rank: rankFromTotal(total) };
    } catch (e) {
        console.error("保存エラー:", e);
        return null;
    }
}

// ログイン状態の監視と初期化
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadQuizzes(); // ログインしていれば問題開始
    } else {
        // 強制リダイレクトせず、その場で案内を出す
        document.getElementById('question-text').innerText = "検定を受けるにはログインが必要です。";
        document.getElementById('question-number').innerText = LEVEL_NAMES[currentLevel] || "";
        const optionsContainer = document.getElementById('answer-options');
        optionsContainer.innerHTML = "";
        const btn = document.createElement('button');
        btn.className = "option-btn login-prompt-btn";
        btn.innerText = "ログイン / 新規登録へ進む";
        btn.onclick = () => { window.location.href = "auth.html"; };
        optionsContainer.appendChild(btn);
    }
});
