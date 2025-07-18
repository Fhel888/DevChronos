// Configurações e dados globais
const CONFIG = {
    adminCredentials: {
        username: 'admin',
        password: 'admin123'
    },
    meses: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    diasSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    tiposEvento: {
        'tecnologia': { label: 'Tecnologia', color: '#0891b2' },
        'empregabilidade': { label: 'Empregabilidade', color: '#059669' },
        'saude': { label: 'Saúde', color: '#dc2626' },
        'integracao': { label: 'Integração', color: '#d97706' }
    }
};

// Estado da aplicação
let appState = {
    currentDate: new Date(),
    viewMode: 'monthly',
    isAdminLoggedIn: false,
    events: [],
    filters: {
        tipo: '',
        publico: '',
        periodo: ''
    },
    editingEvent: null,
    currentEventImage: null
};

// Classe para gerenciar eventos
class EventManager {
    constructor() {
        this.loadEvents();
    }

    loadEvents() {
        // 🧹 LIMPEZA INICIAL: Remove qualquer evento de exemplo existente
        // Esta linha pode ser comentada após a primeira execução em produção
        // localStorage.removeItem('calendar_events'); // COMENTADO PARA MANTER OS EVENTOS
        
        const savedEvents = localStorage.getItem('calendar_events');
        if (savedEvents) {
            appState.events = JSON.parse(savedEvents);
        } else {
            // Iniciar sem eventos - admin deve cadastrar através da interface
            appState.events = [];
            this.saveEvents();
        }
    }

    saveEvents() {
        localStorage.setItem('calendar_events', JSON.stringify(appState.events));
    }

    addEvent(eventData) {
        const newEvent = {
            ...eventData,
            id: Date.now(),
            data: new Date(eventData.data),
            imagem: eventData.imagem || null
        };
        appState.events.push(newEvent);
        this.saveEvents();
        return newEvent;
    }

    updateEvent(id, eventData) {
        const index = appState.events.findIndex(event => event.id === id);
        if (index !== -1) {
            appState.events[index] = {
                ...appState.events[index],
                ...eventData,
                data: new Date(eventData.data),
                imagem: eventData.imagem !== undefined ? eventData.imagem : appState.events[index].imagem
            };
            this.saveEvents();
            return appState.events[index];
        }
        return null;
    }

    deleteEvent(id) {
        const index = appState.events.findIndex(event => event.id === id);
        if (index !== -1) {
            appState.events.splice(index, 1);
            this.saveEvents();
            return true;
        }
        return false;
    }

    clearAllEvents() {
        appState.events = [];
        this.saveEvents();
        return true;
    }

    getEventsByMonth(year, month) {
        return appState.events.filter(event => {
            const eventDate = new Date(event.data);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
    }

    getFilteredEvents(year, month) {
        let events = this.getEventsByMonth(year, month);
        
        if (appState.filters.tipo) {
            events = events.filter(event => event.tipo === appState.filters.tipo);
        }
        
        if (appState.filters.publico) {
            events = events.filter(event => event.publico === appState.filters.publico);
        }
        
        if (appState.filters.periodo) {
            events = events.filter(event => event.periodo === appState.filters.periodo);
        }
        
        return events;
    }

    getDestaques() {
        const now = new Date();
        const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, 0);
        
        // Buscar eventos em destaque no período de 3 meses
        const recentEvents = appState.events.filter(event => {
            const eventDate = new Date(event.data);
            return eventDate >= now && eventDate <= threeMonthsFromNow && event.destaque;
        });

        // Organizar por tipo, pegando o mais próximo de cada tipo
        const destaquesPorTipo = {};
        ['tecnologia', 'empregabilidade', 'saude', 'integracao'].forEach(tipo => {
            const eventosDoTipo = recentEvents
                .filter(event => event.tipo === tipo)
                .sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordenar por data
            
            if (eventosDoTipo.length > 0) {
                destaquesPorTipo[tipo] = eventosDoTipo[0]; // Primeiro (mais próximo) evento do tipo
            }
        });

        return destaquesPorTipo;
    }
}

// Classe para gerenciar o calendário
class CalendarRenderer {
    constructor() {
        this.initializeYearSelector();
    }

    initializeYearSelector() {
        const yearSelect = document.getElementById('yearSelect');
        const currentYear = new Date().getFullYear();
        
        for (let year = currentYear - 100; year <= currentYear + 100; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    }

    updateDateSelectors() {
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');
        
        monthSelect.value = appState.currentDate.getMonth();
        yearSelect.value = appState.currentDate.getFullYear();
    }

    renderMonthlyView() {
        const calendarGrid = document.getElementById('calendarGrid');
        const year = appState.currentDate.getFullYear();
        const month = appState.currentDate.getMonth();
        
        // Primeira data do mês
        const firstDay = new Date(year, month, 1);
        // Última data do mês
        const lastDay = new Date(year, month + 1, 0);
        // Primeiro domingo da grade
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        calendarGrid.innerHTML = '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const events = eventManager.getFilteredEvents(year, month);
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.getTime() === today.getTime();
            
            if (!isCurrentMonth) {
                dayElement.classList.add('other-month');
            }
            
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            // Número do dia
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDate.getDate();
            dayElement.appendChild(dayNumber);
            
            // Eventos do dia
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.data);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === currentDate.getTime();
            });
            
            if (dayEvents.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'day-events';
                
                dayEvents.slice(0, 3).forEach(event => {
                    const eventDot = document.createElement('div');
                    eventDot.className = `event-dot event-${event.tipo}`;
                    eventDot.textContent = event.titulo;
                    eventDot.title = `${event.titulo} - ${event.hora}`;
                    eventDot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showEventDetails(event);
                    });
                    eventsContainer.appendChild(eventDot);
                });
                
                if (dayEvents.length > 3) {
                    const moreEvents = document.createElement('div');
                    moreEvents.className = 'event-dot';
                    moreEvents.style.backgroundColor = '#6b7280';
                    moreEvents.textContent = `+${dayEvents.length - 3} mais`;
                    eventsContainer.appendChild(moreEvents);
                }
                
                dayElement.appendChild(eventsContainer);
            }
            
            // Click no dia para criar evento (apenas admin)
            dayElement.addEventListener('click', () => {
                if (appState.isAdminLoggedIn) {
                    this.openCreateEventModal(currentDate);
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }

    renderQuarterlyView() {
        const quarterlyView = document.getElementById('quarterlyView');
        const currentMonth = appState.currentDate.getMonth();
        const currentYear = appState.currentDate.getFullYear();
        
        // Mês anterior, atual e próximo
        const months = [
            new Date(currentYear, currentMonth - 1, 1),
            new Date(currentYear, currentMonth, 1),
            new Date(currentYear, currentMonth + 1, 1)
        ];
        
        const containers = ['prevMonthCalendar', 'currentMonthCalendar', 'nextMonthCalendar'];
        
        months.forEach((monthDate, index) => {
            const container = document.getElementById(containers[index]);
            this.renderMiniCalendar(container, monthDate, index === 1);
        });
    }

    renderMiniCalendar(container, monthDate, isCurrent) {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        
        container.innerHTML = '';
        
        // Header
        const header = document.createElement('div');
        header.className = 'mini-calendar-header';
        header.textContent = `${CONFIG.meses[month]} ${year}`;
        container.appendChild(header);
        
        // Dias da semana
        const weekdaysContainer = document.createElement('div');
        weekdaysContainer.className = 'mini-weekdays';
        CONFIG.diasSemana.forEach(day => {
            const weekday = document.createElement('div');
            weekday.className = 'mini-weekday';
            weekday.textContent = day;
            weekdaysContainer.appendChild(weekday);
        });
        container.appendChild(weekdaysContainer);
        
        // Grade do calendário
        const grid = document.createElement('div');
        grid.className = 'mini-calendar-grid';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const events = eventManager.getEventsByMonth(year, month);
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'mini-day';
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.getTime() === today.getTime();
            
            if (!isCurrentMonth) {
                dayElement.classList.add('other-month');
            }
            
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            // Verificar se tem eventos
            const hasEvents = events.some(event => {
                const eventDate = new Date(event.data);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === currentDate.getTime();
            });
            
            if (hasEvents) {
                dayElement.classList.add('has-events');
            }
            
            dayElement.textContent = currentDate.getDate();
            
            // Click para navegar ou mostrar eventos
            dayElement.addEventListener('click', () => {
                if (hasEvents && isCurrentMonth) {
                    // Se tem eventos e é do mês atual, mostrar eventos
                    const dayEvents = events.filter(event => {
                        const eventDate = new Date(event.data);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate.getTime() === currentDate.getTime();
                    });
                    
                    if (dayEvents.length === 1) {
                        // Se tem apenas um evento, abrir diretamente
                        this.showEventDetails(dayEvents[0]);
                    } else if (dayEvents.length > 1) {
                        // Se tem múltiplos eventos, navegar para o dia no modo mensal
                        appState.currentDate = new Date(currentDate);
                        // Mudar para visualização mensal
                        document.querySelector('[data-view="monthly"]').click();
                    }
                } else {
                    // Se não tem eventos ou não é do mês atual, apenas navegar
                    appState.currentDate = new Date(currentDate);
                    this.updateViews();
                }
            });
            
            grid.appendChild(dayElement);
        }
        
        container.appendChild(grid);
    }

    renderListView() {
        const listContainer = document.getElementById('listContainer');
        const year = appState.currentDate.getFullYear();
        const month = appState.currentDate.getMonth();
        
        listContainer.innerHTML = '';
        
        const events = eventManager.getFilteredEvents(year, month);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.data);
                return eventDate.getDate() === day;
            });
            
            const dayElement = document.createElement('div');
            dayElement.className = 'list-day';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'list-day-header';
            dayHeader.textContent = `${day} - ${CONFIG.diasSemana[currentDate.getDay()]}`;
            dayElement.appendChild(dayHeader);
            
            if (dayEvents.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'list-events';
                
                dayEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = `list-event ${event.tipo}`;
                    eventElement.innerHTML = `
                        ${event.imagem ? `<img src="${event.imagem}" alt="${event.titulo}" class="list-event-imagem">` : ''}
                        <div class="list-event-content">
                            <div class="list-event-title">${event.titulo}</div>
                            <div class="list-event-details">
                                ${event.hora} - ${event.local} - ${CONFIG.tiposEvento[event.tipo].label}
                            </div>
                        </div>
                        <div style="clear: both;"></div>
                    `;
                    eventElement.addEventListener('click', () => {
                        this.showEventDetails(event);
                    });
                    eventsContainer.appendChild(eventElement);
                });
                
                dayElement.appendChild(eventsContainer);
            } else {
                const noEvents = document.createElement('div');
                noEvents.style.color = '#9ca3af';
                noEvents.style.fontStyle = 'italic';
                noEvents.style.fontSize = '14px';
                noEvents.textContent = 'Nenhum evento';
                dayElement.appendChild(noEvents);
            }
            
            listContainer.appendChild(dayElement);
        }
    }

    renderDestacados() {
        const destacadosGrid = document.getElementById('destacadosGrid');
        const destaques = eventManager.getDestaques();
        
        destacadosGrid.innerHTML = '';
        
        Object.entries(destaques).forEach(([tipo, evento]) => {
            const destaqueElement = document.createElement('div');
            destaqueElement.className = `evento-destaque ${tipo}`;
            
            const dataFormatada = new Date(evento.data).toLocaleDateString('pt-BR');
            
            destaqueElement.innerHTML = `
                ${evento.imagem ? `<img src="${evento.imagem}" alt="${evento.titulo}" class="destaque-imagem">` : ''}
                <div class="destaque-titulo">${evento.titulo}</div>
                <div class="destaque-data">
                    <i class="fas fa-calendar"></i> ${dataFormatada} às ${evento.hora}
                </div>
                <div class="destaque-descricao">${evento.descricao}</div>
            `;
            
            destaqueElement.addEventListener('click', () => {
                this.showEventDetails(evento);
            });
            
            destacadosGrid.appendChild(destaqueElement);
        });
        
        // Se não há destaques, esconder a seção
        const destacadosContainer = document.getElementById('destacadosContainer');
        if (Object.keys(destaques).length === 0) {
            destacadosContainer.style.display = 'none';
        } else {
            destacadosContainer.style.display = 'block';
        }
    }

    renderEventos() {
        const eventosLista = document.getElementById('eventosLista');
        const year = appState.currentDate.getFullYear();
        const month = appState.currentDate.getMonth();
        
        const events = eventManager.getFilteredEvents(year, month);
        
        eventosLista.innerHTML = '';
        
        if (events.length === 0) {
            const noEvents = document.createElement('p');
            noEvents.className = 'no-events';
            noEvents.textContent = 'Nenhum evento encontrado para este período.';
            eventosLista.appendChild(noEvents);
            return;
        }
        
        // Ordenar eventos por data
        events.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        events.forEach(event => {
            const eventoElement = document.createElement('div');
            eventoElement.className = `evento-item ${event.tipo}`;
            
            const dataFormatada = new Date(event.data).toLocaleDateString('pt-BR');
            
            eventoElement.innerHTML = `
                ${event.imagem ? `
                    <div class="evento-imagem-container">
                        <img src="${event.imagem}" alt="${event.titulo}" class="evento-imagem">
                    </div>
                ` : ''}
                <div class="evento-content">
                    <div class="evento-header">
                        <div class="evento-titulo">${event.titulo}</div>
                        ${appState.isAdminLoggedIn ? `
                            <div class="evento-admin-actions">
                                <button class="btn-edit" onclick="calendarRenderer.editEvent(${event.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-delete" onclick="calendarRenderer.deleteEvent(${event.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="evento-info">
                        <div class="evento-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${dataFormatada}</span>
                        </div>
                        <div class="evento-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${event.hora}</span>
                        </div>
                        <div class="evento-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.local}</span>
                        </div>
                        <div class="evento-info-item">
                            <i class="fas fa-tag"></i>
                            <span>${CONFIG.tiposEvento[event.tipo].label}</span>
                        </div>
                        <div class="evento-info-item">
                            <i class="fas fa-users"></i>
                            <span>${this.formatPublicoAlvo(event.publico)}</span>
                        </div>
                        <div class="evento-info-item">
                            <i class="fas fa-sun"></i>
                            <span>${this.formatPeriodo(event.periodo)}</span>
                        </div>
                    </div>
                    ${event.descricao ? `<div class="evento-descricao">${event.descricao}</div>` : ''}
                </div>
            `;
            
            eventoElement.addEventListener('click', (e) => {
                if (!e.target.closest('.evento-admin-actions')) {
                    this.showEventDetails(event);
                }
            });
            
            eventosLista.appendChild(eventoElement);
        });
    }

    formatPublicoAlvo(publico) {
        const publicoMap = {
            'todos': 'Todos',
            'alunos': 'Alunos',
            'professores': 'Professores',
            'escolas-parceiras': 'Escolas Parceiras'
        };
        return publicoMap[publico] || publico;
    }

    formatPeriodo(periodo) {
        const periodoMap = {
            'manha': 'Manhã',
            'tarde': 'Tarde',
            'noite': 'Noite',
            'integral': 'Integral'
        };
        return periodoMap[periodo] || periodo;
    }

    updateViews() {
        this.updateDateSelectors();
        
        // Esconder todas as visualizações
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.classList.add('hidden');
        });
        
        // Mostrar visualização atual
        const currentView = document.getElementById(`${appState.viewMode}View`);
        currentView.classList.remove('hidden');
        
        // Renderizar visualização atual
        switch (appState.viewMode) {
            case 'monthly':
                this.renderMonthlyView();
                break;
            case 'quarterly':
                this.renderQuarterlyView();
                break;
            case 'list':
                this.renderListView();
                break;
        }
        
        this.renderDestacados();
        this.renderEventos();
    }

    showEventDetails(event) {
        if (appState.isAdminLoggedIn) {
            // Modo admin: abrir formulário de edição
            const modal = document.getElementById('eventoModal');
            const form = document.getElementById('eventoForm');
            const title = document.getElementById('eventoModalTitle');
            
            // Configurar a imagem atual do evento sendo editado
            appState.currentEventImage = event.imagem || null;
            
            title.textContent = 'Editar Evento';
            this.populateEventForm(event);
            appState.editingEvent = event;
            
            document.getElementById('saveEventBtn').textContent = 'Salvar';
            document.getElementById('deleteEventBtn').classList.remove('hidden');
            
            modal.classList.remove('hidden');
        } else {
            // Modo visualização: abrir modal de detalhes
            this.showEventDetailsModal(event);
        }
    }

    showEventDetailsModal(event) {
        const modal = document.getElementById('eventoDetalhesModal');
        const title = document.getElementById('eventoDetalhesTitle');
        
        title.textContent = 'Detalhes do Evento';
        
        // Popular informações básicas
        document.getElementById('eventoDetalhesTitulo').textContent = event.titulo;
        document.getElementById('eventoDetalhesData').textContent = new Date(event.data).toLocaleDateString('pt-BR');
        document.getElementById('eventoDetalhesHora').textContent = event.hora;
        document.getElementById('eventoDetalhesLocal').textContent = event.local;
        document.getElementById('eventoDetalhesTipo').textContent = CONFIG.tiposEvento[event.tipo].label;
        document.getElementById('eventoDetalhesPublico').textContent = this.formatPublicoAlvo(event.publico);
        document.getElementById('eventoDetalhesPeriodo').textContent = this.formatPeriodo(event.periodo);
        
        // Mostrar imagem se existir
        const imagemContainer = document.getElementById('eventoDetalhesImagem');
        const imagemElement = document.getElementById('eventoDetalhesImg');
        if (event.imagem) {
            imagemElement.src = event.imagem;
            imagemElement.alt = event.titulo;
            imagemContainer.style.display = 'block';
        } else {
            imagemContainer.style.display = 'none';
        }
        
        // Mostrar descrições
        const breveDescricaoContainer = document.getElementById('eventoDetalhesBreveDescricao');
        const breveDescricaoTexto = document.getElementById('eventoDetalhesBreveDescricaoTexto');
        if (event.descricao && event.descricao.trim()) {
            breveDescricaoTexto.textContent = event.descricao;
            breveDescricaoContainer.style.display = 'block';
        } else {
            breveDescricaoContainer.style.display = 'none';
        }
        
        const descricaoCompletaContainer = document.getElementById('eventoDetalhesDescricaoCompleta');
        const descricaoCompletaTexto = document.getElementById('eventoDetalhesDescricaoCompletaTexto');
        if (event.descricaoCompleta && event.descricaoCompleta.trim()) {
            descricaoCompletaTexto.textContent = event.descricaoCompleta;
            descricaoCompletaContainer.style.display = 'block';
        } else {
            descricaoCompletaContainer.style.display = 'none';
        }
        
        modal.classList.remove('hidden');
    }

    populateEventForm(event, readonly = false) {
        document.getElementById('eventoTitulo').value = event.titulo;
        document.getElementById('eventoDescricao').value = event.descricao || '';
        document.getElementById('eventoDescricaoCompleta').value = event.descricaoCompleta || '';
        document.getElementById('eventoData').value = new Date(event.data).toISOString().split('T')[0];
        document.getElementById('eventoHora').value = event.hora;
        document.getElementById('eventoTipo').value = event.tipo;
        document.getElementById('eventoPublico').value = event.publico;
        document.getElementById('eventoPeriodo').value = event.periodo;
        document.getElementById('eventoLocal').value = event.local;
        document.getElementById('eventoDestaque').checked = event.destaque || false;
        
        // Mostrar imagem se existir
        const imagemPreview = document.getElementById('imagemPreview');
        const imagemPreviewImg = document.getElementById('imagemPreviewImg');
        if (event.imagem) {
            imagemPreviewImg.src = event.imagem;
            imagemPreview.style.display = 'block';
        } else {
            imagemPreview.style.display = 'none';
        }
        
        if (readonly) {
            document.getElementById('eventoDestaque').disabled = true;
            document.getElementById('eventoImagem').disabled = true;
            document.getElementById('removerImagem').style.display = 'none';
        } else {
            document.getElementById('eventoImagem').disabled = false;
            document.getElementById('removerImagem').style.display = event.imagem ? 'block' : 'none';
        }
    }

    openCreateEventModal(date = null) {
        if (!appState.isAdminLoggedIn) return;
        
        const modal = document.getElementById('eventoModal');
        const form = document.getElementById('eventoForm');
        const title = document.getElementById('eventoModalTitle');
        
        title.textContent = 'Criar Evento';
        form.reset();
        
        // Limpar preview de imagem
        document.getElementById('imagemPreview').style.display = 'none';
        appState.currentEventImage = null;
        
        if (date) {
            document.getElementById('eventoData').value = date.toISOString().split('T')[0];
        }
        
        appState.editingEvent = null;
        
        // Habilitar todos os campos
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.disabled = false;
        });
        
        document.getElementById('saveEventBtn').textContent = 'Criar';
        document.getElementById('deleteEventBtn').classList.add('hidden');
        document.querySelector('.form-actions').style.display = 'flex';
        
        modal.classList.remove('hidden');
    }

    editEvent(eventId) {
        const event = appState.events.find(e => e.id === eventId);
        if (event) {
            this.showEventDetails(event);
        }
    }

    deleteEvent(eventId) {
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            eventManager.deleteEvent(eventId);
            this.updateViews();
        }
    }
}

// Inicialização da aplicação
let eventManager;
let calendarRenderer;

document.addEventListener('DOMContentLoaded', function() {
    eventManager = new EventManager();
    calendarRenderer = new CalendarRenderer();
    
    initializeEventListeners();
    calendarRenderer.updateViews();
});

function initializeEventListeners() {
    // Navegação do calendário
    document.getElementById('prevMonth').addEventListener('click', () => {
        appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
        calendarRenderer.updateViews();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
        calendarRenderer.updateViews();
    });
    
    document.getElementById('monthSelect').addEventListener('change', (e) => {
        appState.currentDate.setMonth(parseInt(e.target.value));
        calendarRenderer.updateViews();
    });
    
    document.getElementById('yearSelect').addEventListener('change', (e) => {
        appState.currentDate.setFullYear(parseInt(e.target.value));
        calendarRenderer.updateViews();
    });
    
    // Botões de visualização
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.viewMode = btn.dataset.view;
            calendarRenderer.updateViews();
        });
    });
    
    // Filtros
    document.getElementById('tipoEventoFilter').addEventListener('change', (e) => {
        appState.filters.tipo = e.target.value;
        calendarRenderer.updateViews();
    });
    
    document.getElementById('publicoAlvoFilter').addEventListener('change', (e) => {
        appState.filters.publico = e.target.value;
        calendarRenderer.updateViews();
    });
    
    document.getElementById('periodoFilter').addEventListener('change', (e) => {
        appState.filters.periodo = e.target.value;
        calendarRenderer.updateViews();
    });
    
    // Login admin
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.remove('hidden');
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        appState.isAdminLoggedIn = false;
        updateAdminInterface();
        calendarRenderer.updateViews();
    });
    
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === CONFIG.adminCredentials.username && 
            password === CONFIG.adminCredentials.password) {
            appState.isAdminLoggedIn = true;
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('loginForm').reset();
            updateAdminInterface();
            calendarRenderer.updateViews();
        } else {
            alert('Credenciais inválidas!');
        }
    });
    
    // Criar evento
    document.getElementById('createEventBtn').addEventListener('click', () => {
        calendarRenderer.openCreateEventModal();
    });
    
    // Limpar todos os eventos
    document.getElementById('clearAllEventsBtn').addEventListener('click', () => {
        if (confirm('⚠️ ATENÇÃO! Isso irá excluir TODOS os eventos permanentemente. Tem certeza que deseja continuar?')) {
            if (confirm('Esta ação não pode ser desfeita. Confirma a exclusão de todos os eventos?')) {
                eventManager.clearAllEvents();
                calendarRenderer.updateViews();
                alert('Todos os eventos foram excluídos com sucesso!');
            }
        }
    });
    
    // Form de evento
    document.getElementById('eventoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleEventFormSubmit();
    });
    
    document.getElementById('deleteEventBtn').addEventListener('click', () => {
        if (appState.editingEvent && confirm('Tem certeza que deseja excluir este evento?')) {
            eventManager.deleteEvent(appState.editingEvent.id);
            document.getElementById('eventoModal').classList.add('hidden');
            calendarRenderer.updateViews();
        }
    });
    
    document.getElementById('cancelEventBtn').addEventListener('click', () => {
        document.getElementById('eventoModal').classList.add('hidden');
    });
    
    // Fechar modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });
    
    // Fechar modais clicando fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Upload de imagem
    document.getElementById('eventoImagem').addEventListener('change', handleImageUpload);
    
    // Remover imagem
    document.getElementById('removerImagem').addEventListener('click', () => {
        document.getElementById('eventoImagem').value = '';
        document.getElementById('imagemPreview').style.display = 'none';
        appState.currentEventImage = null;
    });
}

function updateAdminInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const createEventBtn = document.getElementById('createEventBtn');
    const clearAllEventsBtn = document.getElementById('clearAllEventsBtn');
    
    if (appState.isAdminLoggedIn) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        createEventBtn.classList.remove('hidden');
        clearAllEventsBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        createEventBtn.classList.add('hidden');
        clearAllEventsBtn.classList.add('hidden');
    }
}

function handleEventFormSubmit() {
    const formData = {
        titulo: document.getElementById('eventoTitulo').value,
        descricao: document.getElementById('eventoDescricao').value,
        descricaoCompleta: document.getElementById('eventoDescricaoCompleta').value,
        data: document.getElementById('eventoData').value,
        hora: document.getElementById('eventoHora').value,
        tipo: document.getElementById('eventoTipo').value,
        publico: document.getElementById('eventoPublico').value,
        periodo: document.getElementById('eventoPeriodo').value,
        local: document.getElementById('eventoLocal').value,
        destaque: document.getElementById('eventoDestaque').checked,
        imagem: appState.currentEventImage
    };
    
    if (appState.editingEvent) {
        // Se não há nova imagem, manter a existente
        if (formData.imagem === null && appState.editingEvent.imagem) {
            formData.imagem = appState.editingEvent.imagem;
        }
        eventManager.updateEvent(appState.editingEvent.id, formData);
    } else {
        eventManager.addEvent(formData);
    }
    
    document.getElementById('eventoModal').classList.add('hidden');
    appState.currentEventImage = null;
    calendarRenderer.updateViews();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
    }
    
    // Verificar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imagemPreview = document.getElementById('imagemPreview');
        const imagemPreviewImg = document.getElementById('imagemPreviewImg');
        
        imagemPreviewImg.src = e.target.result;
        imagemPreview.style.display = 'block';
        appState.currentEventImage = e.target.result;
        document.getElementById('removerImagem').style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}
