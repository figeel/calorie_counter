export function showNotification(message, type = 'info') {
    // Удаляем предыдущие уведомления
    const existing = document.getElementById('global-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'global-notification';
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}