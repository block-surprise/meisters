import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

const loadingArea = document.getElementById('auth-loading');
const formArea = document.getElementById('auth-form');

// 1. 状態監視
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "mypage.html";
    } else {
        if (loadingArea) loadingArea.style.display = "none";
        if (formArea) formArea.classList.remove('hidden');
    }
});

// 2. Googleログイン
document.getElementById('btn-google').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        alert("Googleログインに失敗しました: " + error.message);
    }
});

// 3. ログイン/新規登録の切り替え（ここが修正ポイント！）
let isLoginMode = true;
const btnSwitch = document.getElementById('btn-switch');
const authTitle = document.getElementById('auth-title');
const btnMain = document.getElementById('btn-main');
const switchText = document.getElementById('switch-text');

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

// 4. 通常のログイン/登録実行
btnMain.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        alert("エラー: " + error.message);
    }
});
