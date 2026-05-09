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

// ログイン状態の監視
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 1. 基本プロフィールの反映
        document.getElementById('display-name').innerText = user.displayName || "名無しのマイスター";
        document.getElementById('user-email').innerText = user.email;
        
        const photoEl = document.getElementById('user-photo');
        if (user.photoURL && photoEl) {
            photoEl.style.backgroundImage = `url(${user.photoURL})`;
            photoEl.style.backgroundSize = "cover";
        }

        // 2. Firestoreからスコアとランクを取得
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // 画面上のスコアとランクを書き換え
                if (document.getElementById('total-correct')) {
                    document.getElementById('total-correct').innerText = data.totalCorrect || 0;
                }
                if (document.getElementById('rank-name')) {
                    document.getElementById('rank-name').innerText = data.rank || "未受検";
                }
                
                // バッジの見た目を更新する（関数は下に定義）
                updateBadgeUI(data.rank);
            }
        } catch (error) {
            console.error("データ取得エラー:", error);
        }

    } else {
        // 未ログインならログイン画面へ
        window.location.href = "auth.html";
    }
});

// ランクに応じてバッジを明るくする演出
function updateBadgeUI(rank) {
    const badges = {
        "ストーン": 0,
        "アイアン": 1,
        "ダイヤモンド": 2
    };
    
    const badgeElements = document.querySelectorAll('.badge-item');
    const rankIndex = badges[rank];

    if (rankIndex !== undefined) {
        // 獲得したランク以下のバッジから 'locked' クラスを外す
        badgeElements.forEach((el, index) => {
            if (index <= rankIndex) {
                el.classList.remove('locked');
                el.style.border = "2px solid #388e3c"; // 合格色
                el.style.color = "#333";
                el.style.background = "#fff";
            }
        });
    }
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
