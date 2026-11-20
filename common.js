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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ランク定義（累計正解数で決まる。全ページ共通の基準） ---
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

function nextRankInfo(total) {
    for (let i = 0; i < RANK_LADDER.length; i++) {
        if (total >= RANK_LADDER[i].min) {
            if (i === 0) return null; // 最高ランク
            const next = RANK_LADDER[i - 1];
            return { name: next.name, remaining: next.min - total };
        }
    }
    return null;
}

// ヘッダー読み込み関数
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const data = await response.text();
        const placeholder = document.getElementById('header-placeholder');

        if (placeholder) {
            placeholder.innerHTML = data;
            // 注入後、少し待ってからイベントを設定（ブラウザのレンダリング待ち）
            setTimeout(setupMenuEvents, 50);
        }
    } catch (error) {
        console.error('Header Load Error:', error);
    }
}

// メニューとログインのイベント設定
function setupMenuEvents() {
    const trigger = document.getElementById('menu-trigger');
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    if (trigger) {
        trigger.onclick = (e) => {
            e.preventDefault();
            trigger.classList.toggle('active');
            if (menu) menu.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        };
    }

    if (overlay) {
        overlay.onclick = () => {
            if (trigger) trigger.classList.remove('active');
            if (menu) menu.classList.remove('open');
            overlay.classList.remove('active');
        };
    }

    // メニュー内のリンクを押したら閉じる
    if (menu) {
        menu.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                if (trigger) trigger.classList.remove('active');
                menu.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            });
        });
    }

    // ログイン監視（ログイン・ログアウトの出し分け＋アイコン＋ホームのステータス）
    onAuthStateChanged(auth, async (user) => {
        const loginItem = document.getElementById('menu-login-item');
        const logoutItem = document.getElementById('menu-logout-item');
        const userLink = document.getElementById('user-link');
        const userIcon = document.getElementById('user-icon');

        if (user) {
            if (loginItem) loginItem.classList.add('hidden');
            if (logoutItem) logoutItem.classList.remove('hidden');
            if (userLink) userLink.href = "mypage.html";
            if (userIcon) {
                if (user.photoURL) {
                    userIcon.style.backgroundImage = `url(${user.photoURL})`;
                    userIcon.style.backgroundSize = "cover";
                    userIcon.style.backgroundPosition = "center";
                    userIcon.textContent = "";
                } else {
                    const initial = (user.displayName || user.email || "M").trim().charAt(0).toUpperCase();
                    userIcon.textContent = initial;
                }
            }
        } else {
            if (loginItem) loginItem.classList.remove('hidden');
            if (logoutItem) logoutItem.classList.add('hidden');
            if (userLink) userLink.href = "auth.html";
            if (userIcon) userIcon.textContent = "";
        }

        updateHomeStatus(user);
    });
}

// ホーム画面のステータスカードを更新する（index.html にだけ存在する要素）
async function updateHomeStatus(user) {
    const rankEl = document.getElementById('current-rank');
    const msgEl = document.getElementById('rank-message');
    const linkEl = document.getElementById('rank-link');
    if (!rankEl || !msgEl) return; // ホーム以外では何もしない

    if (!user) {
        rankEl.innerText = "ゲスト";
        msgEl.innerText = "ログインすると、正解数やランクが記録されます";
        if (linkEl) linkEl.href = "auth.html";
        return;
    }

    if (linkEl) linkEl.href = "mypage.html";

    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const data = snap.data();
            const total = data.totalCorrect || 0;
            const rank = rankFromTotal(total);
            rankEl.innerText = rank;
            if (total === 0) {
                msgEl.innerText = "まずは初級検定に挑戦しよう！";
            } else {
                const next = nextRankInfo(total);
                msgEl.innerText = next
                    ? `累計 ${total} 問正解！次のランク「${next.name}」まであと ${next.remaining} 問`
                    : `累計 ${total} 問正解！最高ランク到達、おめでとう！`;
            }
        } else {
            rankEl.innerText = "未受検";
            msgEl.innerText = "まずは初級検定に挑戦しよう！";
        }
    } catch (error) {
        console.error("Status Load Error:", error);
        rankEl.innerText = "ログイン中";
        msgEl.innerText = "マイページで記録を確認できます";
    }
}

// ログアウト処理（document全体で監視）
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-menu-logout') {
        e.preventDefault();
        if (confirm("ログアウトしますか？")) {
            signOut(auth).then(() => {
                window.location.href = "index.html";
            });
        }
    }
});

// 実行
loadHeader();
