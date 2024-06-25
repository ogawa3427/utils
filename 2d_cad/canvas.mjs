// import { showDOM, changeColor } from './canvas.mjs';

let workingSVG = null;


document.addEventListener('DOMContentLoaded', function () {

    fetch('./sample.svg')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(data, "image/svg+xml");
            const svgElement = svgDoc.documentElement;
            document.getElementById('svg-container').appendChild(svgElement);
            // SVGがロードされた後にノードの階層を表示
            workingSVG = nameSVGNodes(svgElement);
            redrawSVG(workingSVG);
        })
        .catch(error => console.error('Error loading SVG:', error));

    function saveListener(ID) {
        document.getElementById(ID).addEventListener('click', function () {
            const svgContainer = document.getElementById('svg-container');
            const svgContent = svgContainer.innerHTML;
            localStorage.setItem('savedSVG_' + ID, svgContent);
            alert('SVG saved to ' + ID + '!');
        });
    }

    const saveButtonIDs = ['saveToOne', 'saveToTwo', 'saveToThree'];

    for (let ID of saveButtonIDs) {
        saveListener(ID);
    }

    document.getElementById('load-svg-one').addEventListener('click', () => {
        loadSVG('savedSVG_saveToOne');
    });

    document.getElementById('load-svg-two').addEventListener('click', () => {
        loadSVG('savedSVG_saveToTwo');
    });

    document.getElementById('load-svg-three').addEventListener('click', () => {
        loadSVG('savedSVG_saveToThree');
    });

    function loadSVG(storageKey) {
        const svgContainer = document.getElementById('svg-container');
        const savedSVG = localStorage.getItem(storageKey);
        if (savedSVG) {
            svgContainer.innerHTML = savedSVG;
            alert('SVG loaded from ' + storageKey + '!');
        } else {
            // ローカルストレージにSVGがない場合、sample.svgをロードする
            fetch('./sample.svg')
                .then(response => response.text())
                .then(data => {
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(data, "image/svg+xml");
                    const svgElement = svgDoc.documentElement;
                    svgContainer.appendChild(svgElement);
                    alert('Default SVG loaded as no SVG was found in localStorage for ' + storageKey + '.');
                    workingSVG = nameSVGNodes(svgElement);
                    redrawSVG(workingSVG);
                })
                .catch(error => console.error('Error loading SVG:', error));
        }
    }

    // workingSVGの変更を監視するMutationObserverを設定
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                console.log('SVG has changed, re-rendering...');
                // ここに再描画のロジックを追加
                redrawSVG(workingSVG);
            }
        });
    });

    // Observerの設定
    const config = { attributes: true, childList: true, subtree: true };
    if (workingSVG) {
        observer.observe(workingSVG, config);
    }
});

function addToHierarchy(svg, indentLevel = 0) {
    const hierarchyDiv = document.getElementById('hierarchy');
    if (indentLevel === 0) {
        hierarchyDiv.innerHTML = '';
    }
    const nodeName = svg.getAttribute('data-node-name');
    const nodeElement = document.createElement('div');

    // インデントとノード名を設定
    nodeElement.textContent = '  '.repeat(indentLevel) + nodeName;
    nodeElement.style.paddingLeft = `${indentLevel * 20}px`;

    // ホバー効果を追加
    nodeElement.style.cursor = 'pointer';
    nodeElement.addEventListener('mouseover', () => nodeElement.style.backgroundColor = '#f0f0f0');
    nodeElement.addEventListener('mouseout', () => nodeElement.style.backgroundColor = '');

    hierarchyDiv.appendChild(nodeElement);

    // 子要素を再帰的に処理
    for (let child of svg.children) {
        addToHierarchy(child, indentLevel + 1);
    }
}

function nameSVGNodes(svg) {
    let counter = 1;
    let prefix = 'node'; // プレフィックスを定義

    function traverse(element) {
        if (element.nodeType === Node.ELEMENT_NODE) {
            prefix = element.tagName.toLowerCase();
            const uniqueName = `${prefix}${counter}`;
            element.setAttribute('data-node-name', uniqueName);
            counter++;

            for (let child of element.children) {
                traverse(child);
            }
        }
    }

    traverse(svg); // 'node' の代わりに 'svg' を使用
    return svg; // 'node' の代わりに 'svg' を返す
}

// 再描画関数
function redrawSVG(svg) {
    // 再描画に関するコードをここに追加
    console.log('Redrawing SVG...');
    const svgContainer = document.getElementById('svg-container');
    svgContainer.innerHTML = '';
    const svgDoc = new DOMParser().parseFromString(svg.outerHTML, 'image/svg+xml');
    svgContainer.appendChild(svgDoc.documentElement);

    addToHierarchy(workingSVG);
}

export { redrawSVG, nameSVGNodes, workingSVG };
