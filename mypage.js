import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBz-HV0B2bkcwXb7Lv2gtQsqX-ldvb9NO0",
    authDomain: "sentence-checker-1595d.firebaseapp.com",
    projectId: "sentence-checker-1595d",
    // ...残りのConfig
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        // ユーザー情報を反映
        document.getElementById('display-name').innerText = user.displayName || "名無しのマイスター";
        document.getElementById('user-email').innerText = user.email;
        if (user.photoURL) {
            document.getElementById('user-photo').style.backgroundImage = `url(${user.photoURL})`;
        }
    } else {
        // ログインしてなければログイン画面へ戻す
        window.location.href = "auth.html";
    }
});

// ログアウト処理
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});
