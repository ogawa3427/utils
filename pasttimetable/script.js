let timetableData = [];

// データを読み込む
async function loadTimetableData() {
    try {
        const response = await fetch('2023timetable.json');
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
    '１時限': 1,
    '2時限': 2,
    '3時限': 3,
    '4時限': 4,
    '5時限': 5,
    '6時限': 6,
    '7時限': 7
};

// タイムテーブルを更新
function updateTimetable() {
    const term = document.getElementById('termSelect').value;
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

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
                if (course.term !== term) return false;
                
                const [courseDay, coursePeriod] = course.day_period.split('/');
                const courseDayNum = dayMapping[courseDay];
                const coursePeriodNum = periodMapping[coursePeriod.replace('時限', '')];
                
                return courseDayNum === day && coursePeriodNum === period;
            });

            if (courses.length > 0) {
                courses.forEach(course => {
                    const courseDiv = document.createElement('div');
                    courseDiv.className = 'course-cell';
                    
                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'course-name';
                    nameDiv.textContent = course.course_name;
                    
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
}

// イベントリスナーを設定
document.getElementById('termSelect').addEventListener('change', updateTimetable);

// 初期データ読み込み
loadTimetableData(); 