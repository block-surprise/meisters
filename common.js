// ヘッダーを読み込む関数
async function loadHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    try {
        const response = await fetch('header.html');
        const data = await response.text();
        placeholder.innerHTML = data;
        
        // ヘッダー読み込み完了後に、ボタンなどのイベントを設定する
        setupHeaderEvents();
        // ログイン状態の監視も開始（Firebase用）
        observeAuthState();
    } catch (error) {
        console.error('Header load error:', error);
    }
}

// ヘッダー内のボタン操作（ハンバーガーメニューなど）
function setupHeaderEvents() {
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu'); // header.htmlにあるメニュー本体
    const menuClose = document.getElementById('menu-close'); // 閉じるボタン（もしあれば）

    if (menuBtn && navMenu) {
        // メニューボタンをクリックで開閉
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // メニューの外側をクリックしたら閉じる設定（お好みで）
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// Firebaseのログイン状態をチェックして表示を切り替える（後で中身を書く）
function observeAuthState() {
    // ここにFirebaseの onAuthStateChanged を書く予定
    console.log("Checking login status...");
}

// ページ読み込み時に実行
window.addEventListener('DOMContentLoaded', loadHeader);
