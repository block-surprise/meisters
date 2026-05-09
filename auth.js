// Firebaseの設定（自分のプロジェクトのものに書き換えてね）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const loadingArea = document.getElementById('auth-loading');
const formArea = document.getElementById('auth-form');

// ログイン状態を監視
auth.onAuthStateChanged((user) => {
    if (user) {
        // ログイン済みの場合 → マイページ(mypage.html)へリダイレクト
        window.location.href = "mypage.html";
    } else {
        // 未ログインの場合 → ローディングを消してフォームを表示
        loadingArea.classList.add('hidden');
        formArea.classList.remove('hidden');
    }
});

// ログイン・登録の切り替えロジック
let isLoginMode = true;
const btnSwitch = document.getElementById('btn-switch');
const btnMain = document.getElementById('btn-main');
const authTitle = document.getElementById('auth-title');

btnSwitch.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authTitle.innerText = isLoginMode ? "ログイン" : "新規登録";
    btnMain.innerText = isLoginMode ? "ログイン" : "登録する";
    btnSwitch.innerText = isLoginMode ? "新規登録へ" : "ログインへ";
});

// 実行処理（ボタンクリックでFirebase Authを叩く）
btnMain.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isLoginMode) {
        auth.signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
    } else {
        auth.createUserWithEmailAndPassword(email, password).catch(err => alert(err.message));
    }
});
