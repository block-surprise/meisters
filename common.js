import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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

// ヘッダーを読み込む関数
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const data = await response.text();
        const placeholder = document.getElementById('header-placeholder');
        
        if (placeholder) {
            placeholder.innerHTML = data;
            // HTMLを流し込んだ直後に、中身のボタンやFirebaseのイベントを紐付ける
            setupHeaderEvents();
        }
    } catch (error) {
        console.error('Header load error:', error);
    }
}

// ヘッダー内のイベントとFirebase監視をまとめたもの
function setupHeaderEvents() {
    // 1. ロゴクリックでホームへ
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // 2. メニュー開閉ロジック
    const trigger = document.getElementById('menu-trigger'); // または menu-btn
    const menu = document.getElementById('side-menu');     // または nav-menu
    const overlay = document.getElementById('menu-overlay');

    if (trigger && menu && overlay) {
        const toggleMenu = () => {
            trigger.classList.toggle('active');
            menu.classList.toggle('open');
            overlay.classList.toggle('active');
        };
        trigger.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    // 3. ログイン状態監視
    onAuthStateChanged(auth, (user) => {
        const loginItem = document.getElementById('menu-login-item');
        const logoutItem = document.getElementById('menu-logout-item');

        if (user) {
            if (loginItem) loginItem.classList.add('hidden');
            if (logoutItem) logoutItem.classList.remove('hidden');
        } else {
            if (loginItem) loginItem.classList.remove('hidden');
            if (logoutItem) logoutItem.classList.add('hidden');
        }
    });

    // 4. ログアウト処理
    const logoutBtn = document.getElementById('btn-menu-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("ログアウトしますか？")) {
                signOut(auth).then(() => {
                    window.location.href = "index.html";
                });
            }
        });
    }
}

// 実行
loadHeader();
