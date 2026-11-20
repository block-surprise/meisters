import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// --- Firebase 設定 ---
const firebaseConfig = {
  apiKey: "AIzaSyBz-HV0B2bkcwXb7Lv2gtQsqX-ldvb9NO0",
  authDomain: "sentence-checker-1595d.firebaseapp.com",
  projectId: "sentence-checker-1595d",
  storageBucket: "sentence-checker-1595d.firebasestorage.app",
  messagingSenderId: "987027897244",
  appId: "1:987027897244:web:c80cba1feb361e41692659",
  measurementId: "G-WKKZ8PTCKQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- ランク定義（累計正解数。common.js と共通の基準） ---
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

const MEDALS = ["🥇", "🥈", "🥉"];

async function loadRanking(currentUid) {
    const listEl = document.getElementById('ranking-list');
    try {
        const q = query(collection(db, "users"), orderBy("totalCorrect", "desc"), limit(20));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            listEl.innerHTML = '<p class="ranking-status">まだ記録がありません。最初の挑戦者になろう！</p>';
            return;
        }

        listEl.innerHTML = "";
        let rank = 0;
        snapshot.forEach((docSnap) => {
            rank++;
            const data = docSnap.data();
            const total = data.totalCorrect || 0;
            const name = data.displayName || "名無しのマイスター";
            const isMe = currentUid && docSnap.id === currentUid;

            const item = document.createElement('div');
            item.className = "ranking-item" + (isMe ? " is-me" : "");

            const rankSpan = document.createElement('span');
            rankSpan.className = "rank-num";
            rankSpan.innerText = MEDALS[rank - 1] || `${rank}位`;

            const nameSpan = document.createElement('span');
            nameSpan.className = "rank-user";
            nameSpan.innerText = isMe ? `${name}（あなた）` : name;

            const scoreSpan = document.createElement('span');
            scoreSpan.className = "rank-score";
            scoreSpan.innerText = `${rankFromTotal(total)} ・ ${total}問`;

            item.appendChild(rankSpan);
            item.appendChild(nameSpan);
            item.appendChild(scoreSpan);
            listEl.appendChild(item);
        });
    } catch (error) {
        console.error("ランキング取得エラー:", error);
        listEl.innerHTML = '<p class="ranking-status">ランキングを取得できませんでした。時間をおいてもう一度開いてください。</p>';
    }
}

onAuthStateChanged(auth, (user) => {
    loadRanking(user ? user.uid : null);
});
