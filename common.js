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

document.addEventListener("DOMContentLoaded", () => {
    // 1. ヘッダーとメニューのHTMLを注入
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
            <header class="main-header">
                <div class="header-inner">
                    <h1 class="logo" style="cursor:pointer;">SURGE PRO</h1>
                    <button id="menu-trigger" class="menu-trigger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            <nav id="side-menu" class="side-menu">
                <ul class="menu-list">
                    <li><a href="index.html">🏠 ホーム</a></li>
                    <li><a href="quiz.html">⚔️ 検定を受ける</a></li>
                    <li><a href="mypage.html">👤 マイページ</a></li>
                    <li class="menu-sep"></li>
                    <li id="menu-login-item"><a href="auth.html">🔑 ログイン</a></li>
                    <li id="menu-logout-item" class="hidden"><a href="#" id="btn-menu-logout">🚪 ログアウト</a></li>
                </ul>
            </nav>
            <div id="menu-overlay" class="menu-overlay"></div>
        `;

        // ロゴクリックでホームへ
        document.querySelector('.logo').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // --- メニュー開閉ロジック ---
        const trigger = document.getElementById('menu-trigger');
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('menu-overlay');

        const toggleMenu = () => {
            trigger.classList.toggle('active');
            menu.classList.toggle('open');
            overlay.classList.toggle('active');
        };

        trigger.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        // --- ログイン状態監視 ---
        onAuthStateChanged(auth, (user) => {
            const loginItem = document.getElementById('menu-login-item');
            const logoutItem = document.getElementById('menu-logout-item');

            if (user) {
                // ログイン中：ログアウトを表示、ログインを隠す
                if (loginItem) loginItem.classList.add('hidden');
                if (logoutItem) logoutItem.classList.remove('hidden');
            } else {
                // 未ログイン：ログインを表示、ログアウトを隠す
                if (loginItem) loginItem.classList.remove('hidden');
                if (logoutItem) logoutItem.classList.add('hidden');
            }
        });

        // --- ログアウト処理 ---
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
    }
});
