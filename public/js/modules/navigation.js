export function initNavigation(currentUser) {
    renderNavigation(currentUser);
    setupNavigationHandlers();
}

export function renderNavigation(currentUser) {
    const nav = document.getElementById('nav');
    if (!nav) return;

    nav.innerHTML = `
        <ul>
            <li><a href="#" data-section="calculator">Калькулятор</a></li>
            ${currentUser ? `
                <li><span>Привет, ${currentUser.email}</span></li>
                <li><a href="#" id="logout">Выйти</a></li>
                ${currentUser.role === 'admin' ? `
                    <li><a href="#" data-section="admin">Админ-панель</a></li>
                ` : ''}
            ` : `
                <li><a href="#" data-section="login">Войти</a></li>
                <li><a href="#" data-section="register">Регистрация</a></li>
            `}
        </ul>
    `;
}

function setupNavigationHandlers() {
    document.querySelectorAll('nav a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
    
    document.getElementById('logout')?.addEventListener('click', () => {
        if (typeof logout === 'function') logout();
    });
}

export function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.toggle('hidden-section', true);
        section.classList.toggle('active-section', false);
    });

    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
        activeSection.classList.toggle('hidden-section', false);
        activeSection.classList.toggle('active-section', true);
    }
}