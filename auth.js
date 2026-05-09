// CDNから必要な機能をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// あなたのFirebase設定
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

// 要素の取得
const loadingArea = document.getElementById('auth-loading');
const formArea = document.getElementById('auth-form');

// --- 修正ポイント：判定を確実に行う ---
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed. User:", user); // デバッグ用

    if (user) {
        // ログイン済みならリダイレクト
        window.location.href = "mypage.html";
    } else {
        // 未ログインなら、必ず表示を切り替える
        if (loadingArea) loadingArea.style.display = "none"; 
        if (formArea) formArea.classList.remove('hidden');
    }
}, (error) => {
    // もしFirebaseとの通信自体でエラーが起きた場合
    console.error("Firebase Auth Error:", error);
    alert("通信エラーが起きました。ページを再読み込みしてください。");
});

// ログイン・登録ボタンのイベント（以下略）
const btnMain = document.getElementById('btn-main');
if (btnMain) {
    btnMain.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isLoginMode = document.getElementById('auth-title').innerText === "ログイン";

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error(error);
            alert("エラー: " + error.message);
        }
    });
}
