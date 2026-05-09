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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

    // 反応しないのを防ぐため、古いイベントを一度リセットして確実に登録
    if (trigger) {
        trigger.onclick = null; // 念のため解除
        trigger.onclick = (e) => {
            e.preventDefault();
            console.log("Menu Toggle Clicked"); // 動いているか確認用
            trigger.classList.toggle('active');
            if (menu) menu.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        };
    }

    if (overlay) {
        overlay.onclick = () => {
            trigger.classList.remove('active');
            menu.classList.remove('open');
            overlay.classList.remove('active');
        };
    }

    // ログイン監視（ログイン・ログアウトの出し分け）
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
