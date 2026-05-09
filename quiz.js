import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();


async function saveResult(score) {
    const user = auth.currentUser;
    if (!user) return; 

    const userRef = doc(db, "users", user.uid);
    
    
    const docSnap = await getDoc(userRef);
    let bestScore = score;

    if (docSnap.exists()) {
        const prevScore = docSnap.data().totalCorrect || 0;
        if (prevScore > score) bestScore = prevScore;
    }

    // データの保存
    await setDoc(userRef, {
        totalCorrect: bestScore,
        lastPlayed: new Date(),
        rank: calculateRank(bestScore) 
    }, { merge: true });

    console.log("スコアを保存しました！");
}

function calculateRank(score) {
    if (score >= 10) return "ダイヤモンド";
    if (score >= 7) return "アイアン";
    return "ストーン";
}


onAuthStateChanged(auth, (user) => {
    const loginItem = document.getElementById('menu-login-item');
    const logoutItem = document.getElementById('menu-logout-item');
    

    const path = window.location.pathname;

    if (user) {
  
        if (loginItem) loginItem.classList.add('hidden');
        if (logoutItem) logoutItem.classList.remove('hidden');


        if (path.includes("auth.html")) {
            window.location.href = "mypage.html";
        }
    } else {

        if (loginItem) loginItem.classList.remove('hidden');
        if (logoutItem) logoutItem.classList.add('hidden');


        const isProtectedPage = path.includes("map.html") || 
                               path.includes("quiz.html") || 
                               path.includes("mypage.html");
        
        if (isProtectedPage) {
            alert("この機能を利用するにはログインが必要です。");
            window.location.href = "auth.html";
        }
    }
});
