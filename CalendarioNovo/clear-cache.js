/**
 * Script para limpar cache do localStorage
 * 
 * INSTRUÇÕES DE USO:
 * 1. Abra o navegador e vá para o calendário
 * 2. Pressione F12 para abrir as ferramentas de desenvolvedor
 * 3. Vá para a aba "Console"
 * 4. Copie e cole o código abaixo:
 * 
 * localStorage.removeItem('calendar_events');
 * localStorage.removeItem('admin_logged_in');
 * location.reload();
 * 
 * 5. Pressione Enter
 * 
 * Isso irá limpar todos os eventos salvos e recarregar a página
 */

// Função para limpar completamente o cache
function clearCalendarCache() {
    localStorage.removeItem('calendar_events');
    localStorage.removeItem('admin_logged_in');
    console.log('Cache do calendário limpo com sucesso!');
    console.log('Recarregando a página...');
    location.reload();
}

// Para usar, digite no console do navegador: clearCalendarCache()
