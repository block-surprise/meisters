import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ランク定義（累計正解数。common.js / quiz.js と共通の基準） ---
const RANK_LADDER = [
    { name: "ネザライト", min: 120, icon: "🔥" },
    { name: "ダイヤモンド", min: 80, icon: "💎" },
    { name: "ゴールド", min: 50, icon: "🟡" },
    { name: "アイアン", min: 20, icon: "⚙️" },
    { name: "ストーン", min: 1, icon: "🪨" },
    { name: "未受検", min: 0, icon: "🛡️" }
];

function rankFromTotal(total) {
    for (const r of RANK_LADDER) {
        if (total >= r.min) return r;
    }
    return RANK_LADDER[RANK_LADDER.length - 1];
}

function nextRankInfo(total) {
    for (let i = 0; i < RANK_LADDER.length; i++) {
        if (total >= RANK_LADDER[i].min) {
            if (i === 0) return null;
            const next = RANK_LADDER[i - 1];
            return { name: next.name, remaining: next.min - total };
        }
    }
    return null;
}

// ログイン状態の監視
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 1. 基本プロフィールの反映
        document.getElementById('display-name').innerText = user.displayName || "名無しのマイスター";
        document.getElementById('user-email').innerText = user.email;

        const photoEl = document.getElementById('user-photo');
        if (photoEl) {
            if (user.photoURL) {
                photoEl.style.backgroundImage = `url(${user.photoURL})`;
                photoEl.style.backgroundSize = "cover";
                photoEl.style.backgroundPosition = "center";
            } else {
                photoEl.innerText = (user.displayName || user.email || "M").trim().charAt(0).toUpperCase();
                photoEl.classList.add('initial-icon');
            }
        }

        // 2. Firestoreからスコアと進捗を取得
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const total = data.totalCorrect || 0;
                const rank = rankFromTotal(total);

                const totalEl = document.getElementById('total-correct');
                if (totalEl) totalEl.innerText = total;

                const rankEl = document.getElementById('rank-name');
                if (rankEl) rankEl.innerText = rank.name;

                const badgeIconEl = document.getElementById('rank-badge');
                if (badgeIconEl) badgeIconEl.innerText = rank.icon;

                const nextEl = document.getElementById('next-rank-msg');
                if (nextEl) {
                    const next = nextRankInfo(total);
                    nextEl.innerText = next
                        ? `次のランク「${next.name}」まであと ${next.remaining} 問`
                        : "最高ランク到達！おめでとうございます";
                }

                updateBadgeUI(data.clearedLevels || {});
            } else {
                const rankEl = document.getElementById('rank-name');
                if (rankEl) rankEl.innerText = "未受検";
                const nextEl = document.getElementById('next-rank-msg');
                if (nextEl) nextEl.innerText = "まずは初級検定に挑戦しよう！";
            }
        } catch (error) {
            console.error("データ取得エラー:", error);
        }

    } else {
        // 未ログインならログイン画面へ
        window.location.href = "auth.html";
    }
});

// 合格したレベルのバッジを点灯させる
function updateBadgeUI(clearedLevels) {
    const levelOrder = ["beginner", "intermediate", "advanced"];
    const badgeElements = document.querySelectorAll('.badge-item');

    badgeElements.forEach((el, index) => {
        const level = el.dataset.level || levelOrder[index];
        if (level && clearedLevels[level]) {
            el.classList.remove('locked');
            el.classList.add('unlocked');
        }
    });
}

// ログアウト処理
const logoutBtn = document.getElementById('btn-logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        }).catch((error) => {
            alert("ログアウトに失敗しました");
        });
    });
}
