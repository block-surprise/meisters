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

// 状態管理変数
let quizData = [];
let currentIndex = 0;
let score = 0;

// URLからレベルを取得 (?level=beginner など)
const urlParams = new URLSearchParams(window.location.search);
const currentLevel = urlParams.get('level') || 'beginner';

// 1. 問題を読み込む
async function loadQuizzes() {
    try {
        const q = query(
            collection(db, "quizzes"), 
            where("level", "==", currentLevel)
        );
        const snapshot = await getDocs(q);
        quizData = snapshot.docs.map(doc => doc.data());

        if (quizData.length === 0) {
            document.getElementById('question-text').innerText = "問題が見つかりませんでした。";
            return;
        }

        // 10問に絞る（またはシャッフル）
        quizData = quizData.sort(() => Math.random() - 0.5).slice(0, 10);
        showQuestion();
    } catch (e) {
        console.error("読み込みエラー:", e);
        document.getElementById('question-text').innerText = "エラーが発生しました。";
    }
}

// 2. 問題を表示する
function showQuestion() {
    const question = quizData[currentIndex];
    document.getElementById('question-text').innerText = question.question;
    document.getElementById('question-number').innerText = `第 ${currentIndex + 1} 問 / ${quizData.length}`;
    
    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = "";

    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(btn);
    });

    // プログレスバー更新
    const progress = (currentIndex / quizData.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// 3. 正誤判定
function checkAnswer(choice) {
    if (choice === quizData[currentIndex].answerIndex) {
        score++;
    }

    currentIndex++;
    if (currentIndex < quizData.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

// 4. 終了処理
async function finishQuiz() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');
    document.getElementById('score-val').innerText = score;
    document.getElementById('progress-bar').style.width = `100%`;

    // ランク計算と保存
    const rank = calculateRank(score);
    document.getElementById('result-rank-msg').innerText = `あなたのランクは「${rank}」です！`;
    
    await saveResult(score);
}

// --- 以下、あなたが書いていた保存ロジック ---
async function saveResult(score) {
    const user = auth.currentUser;
    if (!user) return; 

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    let bestScore = score;

    if (docSnap.exists()) {
        const prevScore = docSnap.data().totalCorrect || 0;
        if (prevScore > score) bestScore = prevScore;
    }

    await setDoc(userRef, {
        totalCorrect: bestScore,
        lastPlayed: new Date(),
        rank: calculateRank(bestScore) 
    }, { merge: true });
}

function calculateRank(score) {
    if (score >= 10) return "ダイヤモンド";
    if (score >= 7) return "アイアン";
    return "ストーン";
}

// ログイン状態の監視と初期化
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadQuizzes(); // ログインしていれば問題開始
    } else {
        alert("ログインが必要です。");
        window.location.href = "auth.html";
    }
});
