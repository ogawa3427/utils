let timetableData = [];

// データを読み込む
async function loadTimetableData() {
    try {
        const year = document.getElementById('yearSelect').value;
        const response = await fetch(`${year}timetable.json`);
        timetableData = await response.json();
        updateTimetable();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
    }
}

// 曜日と時限のマッピング
const dayMapping = {
    '月': 1,
    '火': 2,
    '水': 3,
    '木': 4,
    '金': 5
};

// 時限のマッピング
const periodMapping = {
    '1': 1, '１': 1,
    '2': 2, '２': 2,
    '3': 3, '３': 3,
    '4': 4, '４': 4,
    '5': 5, '５': 5,
    '6': 6, '６': 6,
    '7': 7, '７': 7
};

// 曜日と時限のペアを解析する関数
function parseDayPeriod(dayPeriodStr) {
    const days = [];
    const periods = [];
    let currentDay = null;
    let currentPeriod = null;
    
    // 文字列を1文字ずつ処理
    for (let i = 0; i < dayPeriodStr.length; i++) {
        const char = dayPeriodStr[i];
        
        // 曜日の処理
        if (dayMapping[char]) {
            currentDay = dayMapping[char];
            days.push(currentDay);
            continue;
        }
        
        // 数字（時限）の処理
        if (periodMapping[char]) {
            currentPeriod = periodMapping[char];
            periods.push(currentPeriod);
            continue;
        }
        
        // スラッシュの処理
        if (char === '/') {
            continue;
        }
    }
    
    // エラーチェック
    if (days.length === 0 || periods.length === 0) {
        throw new Error('曜日または時限が見つかりません');
    }
    
    // 曜日と時限の対応を生成
    const pairs = [];
    
    // 曜日と時限の数が一致する場合
    if (days.length === periods.length) {
        for (let i = 0; i < days.length; i++) {
            pairs.push({ day: days[i], period: periods[i] });
        }
    }
    // 曜日が1つで時限が複数の場合
    else if (days.length === 1) {
        periods.forEach(period => {
            pairs.push({ day: days[0], period: period });
        });
    }
    // 時限が1つで曜日が複数の場合
    else if (periods.length === 1) {
        days.forEach(day => {
            pairs.push({ day: day, period: periods[0] });
        });
    }
    else {
        throw new Error('曜日と時限の対応が不明確です');
    }
    
    return pairs;
}

// タイムテーブルを更新
function updateTimetable() {
    const term = document.getElementById('termSelect').value;
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';
    
    // エラーメッセージを表示する要素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    tbody.parentNode.insertBefore(errorDiv, tbody);
    errorDiv.innerHTML = '';

    // 表示された科目を追跡するためのセット
    const displayedCourses = new Set();

    // 7時限分の行を作成
    for (let period = 1; period <= 7; period++) {
        const row = document.createElement('tr');
        
        // 時限セル
        const periodCell = document.createElement('td');
        periodCell.className = 'period-cell';
        periodCell.textContent = `${period}時限`;
        row.appendChild(periodCell);

        // 各曜日のセル
        for (let day = 1; day <= 5; day++) {
            const cell = document.createElement('td');
            const courses = timetableData.filter(course => {
                // 学期の判定を修正
                const selectedTerm = term;
                // Q1Q2のような形式を[Q1, Q2]のような配列に変換
                const courseTerms = course.term.match(/Q[1-4]/g) || [];
                if (!courseTerms.includes(selectedTerm)) return false;
                
                try {
                    const pairs = parseDayPeriod(course.day_period);
                    return pairs.some(pair => pair.day === day && pair.period === period);
                } catch (error) {
                    errorDiv.innerHTML += `<p>エラー: ${course.course_code} - ${error.message}</p>`;
                    return false;
                }
            });

            if (courses.length > 0) {
                courses.forEach(course => {
                    // 表示された科目を記録
                    displayedCourses.add(course.course_code);
                    
                    const courseDiv = document.createElement('div');
                    courseDiv.className = 'course-cell';
                    
                    // 科目の種類に応じた背景色を設定
                    switch(course.type) {
                        case '必修':
                        case '専門':
                            courseDiv.style.backgroundColor = '#ffebee'; // 淡いピンク
                            break;
                        case 'GS':
                            courseDiv.style.backgroundColor = '#e3f2fd'; // 青
                            break;
                        case '他学域':
                        case 'その他':
                            courseDiv.style.backgroundColor = '#f5f5f5'; // 灰色
                            break;
                        case '言語':
                            courseDiv.style.backgroundColor = '#e8f5e9'; // 黄緑
                            break;
                        case '基礎':
                            courseDiv.style.backgroundColor = '#fff3e0'; // 黄色
                            break;
                    }
                    
                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'course-name';
                    // 科目名の重複を防ぐ
                    const courseName = course.course_name;
                    const uniqueName = courseName.length % 2 === 0 && 
                        courseName.slice(0, courseName.length/2) === courseName.slice(courseName.length/2) ?
                        courseName.slice(0, courseName.length/2) : courseName;
                    nameDiv.textContent = uniqueName;
                    
                    const codeDiv = document.createElement('div');
                    codeDiv.className = 'course-code';
                    codeDiv.textContent = course.course_code;
                    
                    courseDiv.appendChild(nameDiv);
                    courseDiv.appendChild(codeDiv);
                    cell.appendChild(courseDiv);
                });
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }

    // 表示されなかった科目をコンソールに出力
    const notDisplayedCourses = timetableData.filter(course => 
        course.term === term && !displayedCourses.has(course.course_code)
    );
    
    console.log(`表示された科目数: ${displayedCourses.size}`);
    console.log(`表示されなかった科目数: ${notDisplayedCourses.length}`);
    
    if (notDisplayedCourses.length > 0) {
        console.log('表示されなかった科目:', notDisplayedCourses);
    }
}

// イベントリスナーを設定
document.getElementById('termSelect').addEventListener('change', updateTimetable);
document.getElementById('yearSelect').addEventListener('change', loadTimetableData);

// 初期データ読み込み
loadTimetableData(); 