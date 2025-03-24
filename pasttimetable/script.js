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
    '1時限': 1,
    '１時限': 1,
    '2時限': 2,
    '２時限': 2,
    '3時限': 3,
    '３時限': 3,
    '4時限': 4,
    '４時限': 4,
    '5時限': 5,
    '５時限': 5,
    '6時限': 6,
    '６時限': 6,
    '7時限': 7,
    '７時限': 7
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
                const coursePeriodNum = periodMapping[coursePeriod];

                // console.log(courseDay, coursePeriod.replace('時限', ''));

                // console.log(periodMapping[coursePeriod.replace('時限', '')]);
                
                return courseDayNum === day && coursePeriodNum === period;
            });

            if (courses.length > 0) {
                courses.forEach(course => {
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
}

// イベントリスナーを設定
document.getElementById('termSelect').addEventListener('change', updateTimetable);
document.getElementById('yearSelect').addEventListener('change', loadTimetableData);

// 初期データ読み込み
loadTimetableData(); 