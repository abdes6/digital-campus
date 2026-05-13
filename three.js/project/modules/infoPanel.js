const panel = document.getElementById('info-panel');
const panelTitle = document.getElementById('panel-title');
const panelBody = document.getElementById('panel-body');
const closeBtn = document.getElementById('panel-close');

closeBtn.addEventListener('click', () => hidePanel());

export function showInfo(userData) {
    if (!userData || (!userData.name && !userData.type)) return;

    panelTitle.textContent = userData.name || '校园道路';

    let html = '<table>';
    if (userData.info) {
        for (const [k, v] of Object.entries(userData.info)) {
            html += `<tr><td>${k}</td><td>${v}</td></tr>`;
        }
    } else if (userData.type === 'road') {
        html += '<tr><td>类型</td><td>校园道路</td></tr>';
        html += '<tr><td>材质</td><td>沥青路面</td></tr>';
    } else if (userData.type === 'vegetation') {
        html += '<tr><td>类型</td><td>校园植被</td></tr>';
        html += '<tr><td>功能</td><td>绿化美化环境</td></tr>';
    }
    html += '</table>';

    panelBody.innerHTML = html;
    panel.style.display = 'block';
}

export function hidePanel() {
    panel.style.display = 'none';
}
