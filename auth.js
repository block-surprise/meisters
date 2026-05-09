import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// 要素の取得
const loadingArea = document.getElementById('auth-loading');
const formArea = document.getElementById('auth-form');
const btnGoogle = document.getElementById('btn-google');
const btnSwitch = document.getElementById('btn-switch');
const btnMain = document.getElementById('btn-main');
const authTitle = document.getElementById('auth-title');
const switchText = document.getElementById('switch-text');

// 1. ログイン状態の監視（無限ループ対策版）
onAuthStateChanged(auth, (user) => {
    const isAuthPage = window.location.pathname.includes("auth.html");

    if (user) {
        // ログイン済みで、今 auth.html にいるならマイページへ飛ばす
        if (isAuthPage) {
            window.location.href = "mypage.html";
        }
    } else {
        // 未ログインで、今 auth.html にいるならフォームを表示
        if (isAuthPage) {
            if (loadingArea) loadingArea.style.display = "none";
            if (formArea) formArea.classList.remove('hidden');
        }
    }
});

// 2. Googleログイン
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
            // 成功時は onAuthStateChanged が検知してリダイレクトされる
        } catch (error) {
            console.error("Google Login Error:", error);
            alert("Googleログインに失敗しました。");
        }
    });
}

// 3. ログイン/新規登録のモード切り替え
let isLoginMode = true;

if (btnSwitch) {
    btnSwitch.addEventListener('click', () => {
        isLoginMode = !isLoginMode;

        if (isLoginMode) {
            authTitle.innerText = "ログイン";
            btnMain.innerText = "ログイン";
            switchText.innerText = "アカウントをお持ちでないですか？";
            btnSwitch.innerText = "新規登録へ";
        } else {
            authTitle.innerText = "新規登録";
            btnMain.innerText = "登録する";
            switchText.innerText = "既にアカウントをお持ちですか？";
            btnSwitch.innerText = "ログインへ";
        }
    });
}

// 4. 通常のメールアドレスログイン/登録
if (btnMain) {
    btnMain.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert("メールアドレスとパスワードを入力してください。");
            return;
        }

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // 成功時は onAuthStateChanged が検知してリダイレクト
        } catch (error) {
            console.error("Auth Error:", error);
            let msg = "エラーが発生しました。";
            if (error.code === 'auth/email-already-in-use') msg = "このメールアドレスは既に使われています。";
            if (error.code === 'auth/wrong-password') msg = "パスワードが間違っています。";
            if (error.code === 'auth/weak-password') msg = "パスワードは6文字以上で設定してください。";
            alert(msg);
        }
    });
}
