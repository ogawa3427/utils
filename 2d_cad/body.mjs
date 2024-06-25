document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('toggle-mode').addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
    });
    document.getElementById('prompt-input').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('submit-prompt').click();
        }
    });
});

