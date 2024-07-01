import { workingSVG, redrawSVG, nameSVGNodes } from './canvas.mjs';
let lastCommands = [];
let commandIndex = -1;
document.addEventListener('DOMContentLoaded', function () {
    const inputBox = document.getElementById('prompt-input');

    document.getElementById('submit-prompt').addEventListener('click', function () {
        const inputBox = document.getElementById('prompt-input')
        console.log(inputBox.value);
        // document.getElementById('prompt-output').innerText = inputBox.value;
        if (inputBox.value != '') {
            lastCommands.push({
                "command": inputBox.value,
                "result": null
            });
            if (lastCommands.length > 10) {
                lastCommands.shift();
            }
            console.log('Command added to history');
            firstInterpret(inputBox.value);
        } else {
            console.log('No command to add');
        }
        commandIndex = lastCommands.length; // Reset index
        inputBox.value = '';
    });

    document.getElementById('prompt-input').addEventListener('keydown', function (event) {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (commandIndex > 0) {
                commandIndex--;
                document.getElementById('prompt-input').value = lastCommands[commandIndex].command;
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (commandIndex < lastCommands.length - 1) {
                commandIndex++;
                document.getElementById('prompt-input').value = lastCommands[commandIndex].command;
            } else {
                commandIndex = lastCommands.length;
                document.getElementById('prompt-input').value = '';
            }
        }
    });

    function firstInterpret(command) {
        const args = command.split(' ');
        console.log(args);
        if (args[0] == 'load') {
            loadSVG(args[1]);
        } else if (args[0] == 'cc') {
            // 色を変更
            if (args[1] && args[2]) {
                const targetNode = workingSVG.querySelector(`[data-node-name="${args[1]}"]`);
                changeColor(targetNode, args[2]);
            } else {
                lastCommands[lastCommands.length - 1].result = 'Usage: cc <node-name> <color>';
                console.log('使用法: cc <node-name> <color>');
            }
        } else if (args[0] == 'show') {
            console.log('showMode');
            const svg = showDOM(workingSVG);
            lastCommands[lastCommands.length - 1].result = svg;
        } else if (args[0] == 'cf') {
            if (args[1] && args[2]) {
                const targetNode = workingSVG.querySelector(`[data-node-name="${args[1]}"]`);
                changeFillColor(targetNode, args[2]);
            } else {
                lastCommands[lastCommands.length - 1].result = 'Usage: cf <node-name> <color>';
                console.log('使用法: cf <node-name> <color>');
            }
        } else if (args[0] == 'add') {
            if (args[1] && args[2]) {
                let targetNode = workingSVG.querySelector(`[data-node-name="${args[1]}"]`);
                if (!targetNode) {
                    targetNode = workingSVG;
                }
                createNode(targetNode, args[2]);
            } else {
                lastCommands[lastCommands.length - 1].result = 'Usage: add <node-name> <node-type>';
                console.log('使用法: add <node-name> <node-type>');
            }
        } else if (args[0] == 'cp') {
            if (args[1] && args[2] && args[3]) {
                const targetNode = workingSVG.querySelector(`[data-node-name="${args[1]}"]`);
                let currentX = targetNode.getAttribute('cx');
                let currentY = targetNode.getAttribute('cy');
                changeDetial(targetNode, "cx", parseInt(currentX) + parseInt(args[2]));
                changeDetial(targetNode, "cy", parseInt(currentY) + parseInt(args[3]));
            } else {
                lastCommands[lastCommands.length - 1].result = 'Usage: cp <node-name> <x> <y>';
                console.log('使用法: cp <node-name> <x> <y>');
            }
        } else if (args[0] == 'cd') {
            let targetNode = workingSVG.querySelector(`[data-node-name="${args[1]}"]`);
            if (!targetNode) {
                targetNode = workingSVG;
            }
            if (args[1] && args[2] && args[3]) {
                changeDetial(targetNode, args[2], args[3]);
            }
        } else {
            lastCommands[lastCommands.length - 1].result = 'Command not recognized';
            console.log('Command not recognized');
        }
        const outputDiv = document.getElementById('prompt-output');
        outputDiv.innerHTML = '';
        // 入力欄を常に一番下に配置
        outputDiv.appendChild(inputBox);
        lastCommands = lastCommands.reverse();
        for (let command of lastCommands) {
            const commandDiv = document.createElement('div');
            commandDiv.innerText = ">>" + command.command;
            outputDiv.appendChild(commandDiv);
            if (command.result) {
                const resultDiv = document.createElement('div');
                resultDiv.innerHTML = command.result;
                outputDiv.appendChild(resultDiv);
            }
        }
        lastCommands = lastCommands.reverse();
        // 入力欄にフォーカスを移動
        inputBox.focus();
    }


});

function showDOM(svg) {
    console.log(svg);
    return svg;
}

function changeColor(node, color) {
    // 色のバリデーション
    const isValidColor = /^#[0-9A-F]{6}$/i.test(color) || CSS.supports('color', color);
    if (!isValidColor) {
        console.log('無効な色の形式です。色は#RRGGBB形式または有効な色名で指定してください。');
        lastCommands[lastCommands.length - 1].result = `Invalid color format. Please specify the color in #RRGGBB format or a valid color name.`;
        return;
    }

    if (node) {
        node.setAttribute('stroke', color);
        console.log(`ノード "${node.getAttribute('data-node-name')}" の線の色を ${color} に変更しました。`);
        lastCommands[lastCommands.length - 1].result = `Node ${node.getAttribute('data-node-name')} color changed to ${color}`
    } else {
        console.log('指定されたnode-name-numのノードが見つかりません');
        lastCommands[lastCommands.length - 1].result = `Node ${node.getAttribute('data-node-name')} not found`
    }
    redrawSVG(workingSVG);
}

function changeFillColor(node, color) {
    const isValidColor = /^#[0-9A-F]{6}$/i.test(color) || CSS.supports('color', color);
    if (!isValidColor) {
        console.log('無効な色の形式です。色は#RRGGBB形式または有効な色名で指定してください���');
        lastCommands[lastCommands.length - 1].result = `Invalid color format. Please specify the color in #RRGGBB format or a valid color name.`;
        return;
    }

    if (node) {
        node.setAttribute('fill', color);
        console.log(`ノード "${node.getAttribute('data-node-name')}" の塗りつぶしの色を ${color} に変更しました。`);
        lastCommands[lastCommands.length - 1].result = `Node ${node.getAttribute('data-node-name')} fill color changed to ${color}`
    } else {
        console.log('指定されたnode-name-numのノードが見つかりません');
        lastCommands[lastCommands.length - 1].result = `Node ${node.getAttribute('data-node-name')} not found`
    }
    redrawSVG(workingSVG);
}

// バリデーションは三つってこと？
// nodeは共通だから内部に置いとく
// nameはif文で引っかけてるから既に安全
// valは個別に。実行前にバリデーションしましょう

//いつか笑える日が来るさ
function changeDetial(node, detail_name, value) {
    if (node) {
        node.setAttribute(detail_name, value);
        console.log(`ノード "${node.getAttribute('data-node-name')}" の${detail_name}を ${value} に変更しました。`);
        lastCommands[lastCommands.length - 1].result = `Node ${node.getAttribute('data-node-name')} ${detail_name} changed to ${value}`
    } else {
        console.log('指定されたnode-name-numのノードが見つかりません');
        lastCommands[lastCommands.length - 1].result = `Node ${node.getAttribute('data-node-name')} not found`
    }
    redrawSVG(workingSVG);
}

function createNode(node, type) {
    let initDetails = {};
    // SVGで有効な要素かどうかを確認する
    if (!/^svg|rect|circle|ellipse|line|polyline|polygon|path|text|g$/i.test(type)) {
        console.log('無効なtypeです。typeはSVGで有効な要素名を指定してください。');
        lastCommands[lastCommands.length - 1].result = `Invalid type. Please specify a valid SVG element name.`;
        return;
    } else {
        if (type == 'rect') {
            initDetails = {
                x: '0',
                y: '0',
                width: '100',
                height: '100',
                stroke: 'black',
                fill: 'transparent'
            };
        } else if (type == 'circle') {
            initDetails = {
                cx: '0',
                cy: '0',
                r: '50',
                stroke: 'black',
                fill: 'transparent'
            };
        } else if (type == 'ellipse') {
            initDetails = {
                cx: '1',
                cy: '1',
                rx: '10',
                ry: '15',
                stroke: 'black',
                strokeWidth: '5',
                fill: 'transparent'
            };
        } else if (type == 'line') {
            initDetails = {
                x1: '0',
                y1: '0',
                x2: '100',
                y2: '100',
                stroke: 'black'
            };
        } else if (type == 'polyline') {
            initDetails = {
                points: '0,0 50,50 100,0',
                stroke: 'black',
                fill: 'transparent'
            };
        } else if (type == 'polygon') {
            initDetails = {
                points: '0,0 50,50 100,0',
                stroke: 'black',
                fill: 'transparent'
            };
        } else if (type == 'path') {
            initDetails = {
                d: 'M 0 0 L 100 100',
                stroke: 'black',
                fill: 'transparent'
            };
        }
    }
    if (!type || typeof type !== 'string' || !type.trim()) {
        console.log('無効なtypeです。typeは空でない文字列で指定してください。');
        lastCommands[lastCommands.length - 1].result = `Invalid type. Please specify a non-empty string as type.`;
        return;
    }

    if (node) {
        let newNode = document.createElement(type);
        // newNode.setAttribute('data-node-name', 'newNode');
        for (let key in initDetails) {
            newNode.setAttribute(key, initDetails[key]);
        }
        node.appendChild(newNode);
        console.log(`ノード "${node.getAttribute('data-node-name')}" に新しいノードを追加しました。`);
        lastCommands[lastCommands.length - 1].result = `Node ${node.getAttribute('data-node-name')} added new node`
    } else {
        console.log('指定されたnode-name-numのノードが見つかりません');
        lastCommands[lastCommands.length - 1].result = `Target node not found`
    }
    const workingSVGTo = nameSVGNodes(workingSVG);
    redrawSVG(workingSVGTo);
}

export { showDOM, changeColor };

