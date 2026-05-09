// ヘッダーを読み込む
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const data = await response.text();
        document.getElementById('header-placeholder').innerHTML = data;
        
        // ヘッダー読み込み後にイベントを設定
        setupHeaderEvents();
    } catch (error) {
        console.error('Header load error:', error);
    }
}

// ヘッダー内のボタン操作など
function setupHeaderEvents() {
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            alert('メニューを開きます（ここにドロワーの処理を書く）');
        });
    }
    
    // ここでFirebaseのログイン状態をチェックしてアイコンを変える処理を追加予定
}

// 実行
loadHeader();
