/**
 * Redes Carreras SL - PWA
 * Control Documental v1.0
 * 
 * Aplicación para gestionar documentos y certificados con fechas de caducidad.
 * Permite añadir, editar, eliminar y consultar documentos por categorías.
 * Genera notificaciones de caducidad y exportación a PDF.
 * 
 * @author MiniMax Agent
 * @version 2.0.0
 */

// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const CONFIG = {
    STORAGE_KEY: 'redes_carreras_materials',
    NOTIFICATIONS_DAYS: [30, 15, 2],
    CATEGORIES: [
        { id: 'rea', name: 'REA', icon: 'file-text' },
        { id: 'seguro', name: 'Pólizas Seguros', icon: 'shield' },
        { id: 'spa', name: 'SPA', icon: 'first-aid' },
        { id: 'plataformas_prl', name: 'Plataformas PRL', icon: 'layers' },
        { id: 'itv', name: 'ITV', icon: 'truck' },
        { id: 'bateria', name: 'Batería', icon: 'battery' },
        { id: 'extintores', name: 'Extintores', icon: 'fire' },
        { id: 'explosimetros', name: 'Explosímetros', icon: 'activity' },
        { id: 'vehiculos', name: 'Vehículos', icon: 'truck' },
        { id: 'documentos', name: 'Otros Documentos', icon: 'file' }
    ],
    PDF_CONFIG: {
        title: 'Control Documental - Redes Carreras SL',
        subtitle: 'Informe de Caducidades'
    }
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

let materials = [];
let currentFilter = '';
let currentSearch = '';
let deferredPrompt = null;

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    loadMaterials();
    initializeUI();
    initializeNotifications();
    checkExpiringItems();
    initializePWA();
    loadSampleDataIfEmpty();
});

/**
 * Carga los materiales desde localStorage
 */
function loadMaterials() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored) {
            materials = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error al cargar materiales:', error);
        materials = [];
    }
}

/**
 * Guarda los materiales en localStorage
 */
function saveMaterials() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(materials));
    } catch (error) {
        console.error('Error al guardar materiales:', error);
        showToast('Error al guardar los datos', 'error');
    }
}

/**
 * Inicializa la interfaz de usuario
 */
function initializeUI() {
    populateCategoryFilter();
    populateCategorySelect();
    renderMaterials();
    updateStats();
    setupEventListeners();
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        renderMaterials();
    });

    // Filtro por categoría
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderMaterials();
    });

    // Formulario de material
    document.getElementById('materialForm').addEventListener('submit', handleFormSubmit);

    // Exportar PDF
    document.getElementById('btnExportPDF').addEventListener('click', generatePDF);

    // Backup - Exportar
    document.getElementById('btnBackup').addEventListener('click', exportBackup);

    // Backup - Importar
    document.getElementById('btnRestore').addEventListener('click', () => {
        document.getElementById('fileImport').click();
    });

    // Archivo de importación
    document.getElementById('fileImport').addEventListener('change', handleFileImport);

    // Instalación PWA
    document.getElementById('btnInstall').addEventListener('click', installPWA);

    // Validación de fechas
    document.getElementById('materialStart').addEventListener('change', validateDates);
    document.getElementById('materialExpiry').addEventListener('change', validateDates);

    // Modal de detalles - botones
    document.getElementById('btnDeleteMaterial').addEventListener('click', deleteCurrentMaterial);
    document.getElementById('btnEditMaterial').addEventListener('click', editCurrentMaterial);

    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeDetailModal();
        }
    });

    // Cerrar modal al hacer click fuera
    document.getElementById('materialModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDetailModal();
    });
}

// ============================================
// DATOS DE MUESTRA
// ============================================

/**
 * Carga datos de ejemplo si no hay materiales
 */
function loadSampleDataIfEmpty() {
    if (materials.length === 0) {
        const sampleData = [
            {
                id: generateId(),
                categoria: 'rea',
                nombre: 'Certificado REA - Oficial Principal',
                fecha_inicio: getRelativeDate(-180),
                fecha_caducidad: getRelativeDate(185),
                responsable: 'Administración',
                furgoneta: 'Oficina Central',
                notas: 'Renovación obligatoria'
            },
            {
                id: generateId(),
                categoria: 'seguro',
                nombre: 'Seguro Responsabilidad Civil Empresarial',
                fecha_inicio: getRelativeDate(-300),
                fecha_caducidad: getRelativeDate(65),
                responsable: 'Departamento Legal',
                furgoneta: 'N/A',
                notas: 'Póliza principal de la empresa'
            },
            {
                id: generateId(),
                categoria: 'spa',
                nombre: 'Contrato SPA - Servicio Prevención Ajeno',
                fecha_inicio: getRelativeDate(-400),
                fecha_caducidad: getRelativeDate(-30),
                responsable: 'RRHH',
                furgoneta: 'N/A',
                notas: 'CONTRATO CADUCADO - Urgente renovar'
            },
            {
                id: generateId(),
                categoria: 'plataformas_prl',
                nombre: 'Certificación Plataformas de Trabajo PRL',
                fecha_inicio: getRelativeDate(-200),
                fecha_caducidad: getRelativeDate(25),
                responsable: 'Departamento Técnico',
                furgoneta: 'Almacén Principal',
                notas: 'Inspección anual de seguridad'
            },
            {
                id: generateId(),
                categoria: 'itv',
                nombre: 'ITV Furgoneta 1 - Ford Transit',
                fecha_inicio: getRelativeDate(-300),
                fecha_caducidad: getRelativeDate(60),
                responsable: 'Mantenimiento',
                furgoneta: 'Furgoneta 1 (1234 ABC)',
                notas: 'Matrícula: 1234ABC'
            },
            {
                id: generateId(),
                categoria: 'bateria',
                nombre: 'Batería Estacionaria Centro Logístico',
                fecha_inicio: getRelativeDate(-365),
                fecha_caducidad: getRelativeDate(365),
                responsable: 'Mantenimiento',
                furgoneta: 'Centro Logístico',
                notas: 'Sistema de respaldo eléctrico'
            }
        ];

        materials = sampleData;
        saveMaterials();
        renderMaterials();
        updateStats();
    }
}

// ============================================
// CATEGORÍAS
// ============================================

/**
 * Rellena el filtro de categorías
 */
function populateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    CONFIG.CATEGORIES.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

/**
 * Rellena el select de categorías del formulario
 */
function populateCategorySelect() {
    const select = document.getElementById('materialCategory');
    CONFIG.CATEGORIES.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

/**
 * Obtiene el nombre de una categoría
 */
function getCategoryName(categoryId) {
    const category = CONFIG.CATEGORIES.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

// ============================================
// MATERIALES - CRUD
// ============================================

/**
 * Genera un ID único
 */
function generateId() {
    return 'mat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Calcula los días restantes hasta la caducidad
 */
function getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina el estado del material
 */
function getStatus(daysUntilExpiry) {
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 2) return 'danger';
    if (daysUntilExpiry <= 15) return 'warning';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'ok';
}

/**
 * Formatea una fecha para mostrar
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formatea los días restantes
 */
function formatDaysRemaining(days) {
    if (days < 0) {
        return `Caducó hace ${Math.abs(days)} días`;
    }
    if (days === 0) {
        return 'Caduca hoy';
    }
    if (days === 1) {
        return 'Caduca mañana';
    }
    return `Caduca en ${days} días`;
}

/**
 * Obtiene la clase CSS para los días
 */
function getDaysClass(days) {
    if (days < 0) return 'days-danger';
    if (days <= 2) return 'days-danger';
    if (days <= 15) return 'days-warning';
    if (days <= 30) return 'days-warning';
    return 'days-ok';
}

/**
 * Renderiza la lista de materiales
 */
function renderMaterials() {
    const container = document.getElementById('materialsList');
    const emptyState = document.getElementById('emptyState');
    const countElement = document.getElementById('itemCount');

    // Filtrar materiales
    let filteredMaterials = materials.filter(mat => {
        // Filtro por categoría
        if (currentFilter && mat.categoria !== currentFilter) return false;

        // Búsqueda por texto
        if (currentSearch) {
            const searchLower = currentSearch;
            const matchesName = mat.nombre.toLowerCase().includes(searchLower);
            const matchesResponsible = mat.responsable && mat.responsable.toLowerCase().includes(searchLower);
            const matchesVan = mat.furgoneta && mat.furgoneta.toLowerCase().includes(searchLower);
            const matchesCategory = getCategoryName(mat.categoria).toLowerCase().includes(searchLower);
            
            if (!matchesName && !matchesResponsible && !matchesVan && !matchesCategory) {
                return false;
            }
        }

        return true;
    });

    // Ordenar por fecha de caducidad (primero los que caducan antes)
    filteredMaterials.sort((a, b) => {
        const daysA = getDaysUntilExpiry(a.fecha_caducidad);
        const daysB = getDaysUntilExpiry(b.fecha_caducidad);
        return daysA - daysB;
    });

    // Actualizar contador
    countElement.textContent = `${filteredMaterials.length} elemento${filteredMaterials.length !== 1 ? 's' : ''}`;

    // Mostrar estado vacío si no hay materiales
    if (filteredMaterials.length === 0) {
        container.innerHTML = '';
        emptyState.classList.add('visible');
        return;
    }

    emptyState.classList.remove('visible');

    // Renderizar tarjetas
    container.innerHTML = filteredMaterials.map(mat => {
        const days = getDaysUntilExpiry(mat.fecha_caducidad);
        const status = getStatus(days);
        const statusText = status === 'ok' ? 'OK' : status === 'warning' ? 'Atención' : status === 'danger' ? 'Urgente' : 'Caducado';
        
        return `
            <article class="material-card status-${status}" onclick="openDetailModal('${mat.id}')">
                <div class="card-header">
                    <span class="card-category">${getCategoryName(mat.categoria)}</span>
                    <span class="card-status status-${status}">${statusText}</span>
                </div>
                <h3 class="card-title">${escapeHtml(mat.nombre)}</h3>
                <div class="card-details">
                    ${mat.responsable ? `
                        <div class="card-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>${escapeHtml(mat.responsable)}</span>
                        </div>
                    ` : ''}
                    ${mat.furgoneta ? `
                        <div class="card-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="3" width="15" height="13"/>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                            <span>${escapeHtml(mat.furgoneta)}</span>
                        </div>
                    ` : ''}
                    <div class="card-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>Caducidad: ${formatDate(mat.fecha_caducidad)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span>${mat.notas ? 'Con notas' : 'Sin notas'}</span>
                    <span class="card-days ${getDaysClass(days)}">${formatDaysRemaining(days)}</span>
                </div>
            </article>
        `;
    }).join('');
}

/**
 * Actualiza las estadísticas
 */
function updateStats() {
    const total = materials.length;
    const warning = materials.filter(mat => {
        const days = getDaysUntilExpiry(mat.fecha_caducidad);
        return days >= 0 && days <= 30;
    }).length;
    const expired = materials.filter(mat => {
        const days = getDaysUntilExpiry(mat.fecha_caducidad);
        return days < 0;
    }).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statWarning').textContent = warning;
    document.getElementById('statExpired').textContent = expired;
}

// ============================================
// FORMULARIO
// ============================================

/**
 * Abre el modal para añadir un nuevo material
 */
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Añadir Material';
    document.getElementById('materialForm').reset();
    document.getElementById('materialId').value = '';
    
    // Establecer fechas por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('materialStart').value = today;
    document.getElementById('materialExpiry').value = '';
    
    document.getElementById('materialModal').classList.add('active');
    document.getElementById('materialName').focus();
}

/**
 * Abre el modal para editar un material
 */
function openEditModal(id) {
    const mat = materials.find(m => m.id === id);
    if (!mat) return;

    document.getElementById('modalTitle').textContent = 'Editar Material';
    document.getElementById('materialId').value = mat.id;
    document.getElementById('materialCategory').value = mat.categoria;
    document.getElementById('materialName').value = mat.nombre;
    document.getElementById('materialStart').value = mat.fecha_inicio;
    document.getElementById('materialExpiry').value = mat.fecha_caducidad;
    document.getElementById('materialResponsible').value = mat.responsable || '';
    document.getElementById('materialVan').value = mat.furgoneta || '';
    document.getElementById('materialNotes').value = mat.notas || '';

    closeDetailModal();
    document.getElementById('materialModal').classList.add('active');
}

/**
 * Cierra el modal de formulario
 */
function closeModal() {
    document.getElementById('materialModal').classList.remove('active');
}

/**
 * Maneja el envío del formulario
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('materialId').value;
    const categoria = document.getElementById('materialCategory').value;
    const nombre = document.getElementById('materialName').value.trim();
    const fecha_inicio = document.getElementById('materialStart').value;
    const fecha_caducidad = document.getElementById('materialExpiry').value;
    const responsable = document.getElementById('materialResponsible').value.trim();
    const furgoneta = document.getElementById('materialVan').value.trim();
    const notas = document.getElementById('materialNotes').value.trim();

    // Validar que la fecha de inicio sea anterior a la de caducidad
    if (new Date(fecha_inicio) >= new Date(fecha_caducidad)) {
        showToast('La fecha de inicio debe ser anterior a la de caducidad', 'error');
        return;
    }

    const materialData = {
        categoria,
        nombre,
        fecha_inicio,
        fecha_caducidad,
        responsable,
        furgoneta,
        notas
    };

    if (id) {
        // Editar material existente
        const index = materials.findIndex(m => m.id === id);
        if (index !== -1) {
            materials[index] = { ...materials[index], ...materialData };
        }
    } else {
        // Añadir nuevo material
        materials.push({
            id: generateId(),
            ...materialData
        });
    }

    saveMaterials();
    renderMaterials();
    updateStats();
    closeModal();
    showToast(id ? 'Material actualizado correctamente' : 'Material añadido correctamente', 'success');
}

/**
 * Valida que la fecha de inicio sea anterior a la de caducidad
 */
function validateDates() {
    const start = document.getElementById('materialStart').value;
    const expiry = document.getElementById('materialExpiry').value;
    
    if (start && expiry && new Date(start) >= new Date(expiry)) {
        document.getElementById('materialExpiry').setCustomValidity('La fecha de caducidad debe ser posterior a la de inicio');
    } else {
        document.getElementById('materialExpiry').setCustomValidity('');
    }
}

// ============================================
// MODAL DE DETALLES
// ============================================

let currentDetailId = null;

/**
 * Abre el modal de detalles
 */
function openDetailModal(id) {
    const mat = materials.find(m => m.id === id);
    if (!mat) return;

    currentDetailId = id;
    const days = getDaysUntilExpiry(mat.fecha_caducidad);
    const status = getStatus(days);

    const content = document.getElementById('detailContent');
    content.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Categoría</span>
            <span class="detail-value">${getCategoryName(mat.categoria)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Nombre</span>
            <span class="detail-value">${escapeHtml(mat.nombre)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Certificado</span>
            <span class="detail-value">${formatDate(mat.fecha_inicio)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Caducidad</span>
            <span class="detail-value">${formatDate(mat.fecha_caducidad)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Días restantes</span>
            <span class="detail-value">
                <strong style="color: ${status === 'expired' ? '#dc3545' : status === 'danger' ? '#fd7e14' : status === 'warning' ? '#ffc107' : '#28a745'}">
                    ${formatDaysRemaining(days)}
                </strong>
            </span>
        </div>
        ${mat.responsable ? `
            <div class="detail-row">
                <span class="detail-label">Responsable</span>
                <span class="detail-value">${escapeHtml(mat.responsable)}</span>
            </div>
        ` : ''}
        ${mat.furgoneta ? `
            <div class="detail-row">
                <span class="detail-label">Furgoneta</span>
                <span class="detail-value">${escapeHtml(mat.furgoneta)}</span>
            </div>
        ` : ''}
        ${mat.notas ? `
            <div class="detail-row">
                <span class="detail-label">Notas</span>
                <span class="detail-value">${escapeHtml(mat.notas)}</span>
            </div>
        ` : ''}
    `;

    document.getElementById('detailModal').classList.add('active');
}

/**
 * Cierra el modal de detalles
 */
function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    currentDetailId = null;
}

/**
 * Elimina el material actual
 */
function deleteCurrentMaterial() {
    if (!currentDetailId) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
        materials = materials.filter(m => m.id !== currentDetailId);
        saveMaterials();
        renderMaterials();
        updateStats();
        closeDetailModal();
        showToast('Material eliminado correctamente', 'success');
    }
}

/**
 * Edita el material actual
 */
function editCurrentMaterial() {
    if (!currentDetailId) return;
    openEditModal(currentDetailId);
}

// ============================================
// NOTIFICACIONES
// ============================================

/**
 * Inicializa las notificaciones
 */
function initializeNotifications() {
    // Solicitar permisos de notificación
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Verifica los elementos que van a caducar y muestra notificaciones
 */
function checkExpiringItems() {
    if (!('Notification' in window)) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar permisos
    if (Notification.permission !== 'granted') {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        return;
    }

    let notificationShown = false;

    materials.forEach(mat => {
        const days = getDaysUntilExpiry(mat.fecha_caducidad);
        
        CONFIG.NOTIFICATIONS_DAYS.forEach(daysThreshold => {
            if (days === daysThreshold && days >= 0) {
                showNotification(
                    `Recordatorio de caducidad: ${mat.nombre}`,
                    `El material "${mat.nombre}" (${getCategoryName(mat.categoria)}) caduca en ${days} día${days !== 1 ? 's' : ''}.`
                );
                notificationShown = true;
            }
        });
    });

    // Mostrar banner si hay elementos que caducan pronto
    const expiringSoon = materials.filter(mat => {
        const days = getDaysUntilExpiry(mat.fecha_caducidad);
        return days >= 0 && days <= 30;
    });

    const expired = materials.filter(mat => {
        const days = getDaysUntilExpiry(mat.fecha_caducidad);
        return days < 0;
    });

    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';

    if (expired.length > 0) {
        alertContainer.innerHTML += `
            <div class="alert alert-danger">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span><strong>¡Atención!</strong> ${expired.length} material${expired.length !== 1 ? 'es' : ''} caducado${expired.length !== 1 ? 's' : ''}.</span>
            </div>
        `;
    }

    if (expiringSoon.length > 0) {
        alertContainer.innerHTML += `
            <div class="alert alert-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span><strong>Próximas caducidades:</strong> ${expiringSoon.length} material${expiringSoon.length !== 1 ? 'es' : ''} caducan en menos de 30 días.</span>
            </div>
        `;
    }

    // Ocultar alertas después de 10 segundos
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 10000);
}

/**
 * Muestra una notificación del sistema
 */
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'assets/icon-192.png',
            tag: 'caducidad',
            requireInteraction: true
        });
    }
}

// ============================================
// GENERACIÓN DE PDF
// ============================================

/**
 * Genera un PDF con el control de materiales
 */
function generatePDF() {
    // Verificar que jsPDF esté disponible
    if (typeof jspdf === 'undefined') {
        showToast('Error: La librería PDF no está cargada. Por favor, verifica tu conexión a internet.', 'error');
        console.error('jsPDF no disponible');
        return;
    }

    const { jsPDF } = jspdf;
    
    try {
        const doc = new jsPDF();

        // Encabezado con color corporativo rojo
        doc.setFillColor(227, 30, 36);
        doc.rect(0, 0, 210, 45, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Redes Carreras SL', 14, 22);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Control Documental v1.0', 14, 34);

        // Fecha de generación
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Informe generado: ${formatDate(new Date().toISOString())}`, 14, 55);

        // Resumen
        const total = materials.length;
        const expired = materials.filter(m => getDaysUntilExpiry(m.fecha_caducidad) < 0).length;
        const warning = materials.filter(m => {
            const days = getDaysUntilExpiry(m.fecha_caducidad);
            return days >= 0 && days <= 30;
        }).length;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total documentos: ${total}`, 14, 65);
        doc.setTextColor(227, 30, 36);
        doc.text(`Caducados: ${expired}`, 70, 65);
        doc.setTextColor(253, 203, 110);
        doc.text(`Próximos 30 días: ${warning}`, 115, 65);

        // Verificar si autoTable está disponible
        if (typeof doc.autoTable !== 'undefined') {
            // Tabla con autoTable
            const tableData = materials
                .sort((a, b) => getDaysUntilExpiry(a.fecha_caducidad) - getDaysUntilExpiry(b.fecha_caducidad))
                .map(mat => {
                    const days = getDaysUntilExpiry(mat.fecha_caducidad);
                    let status = 'OK';
                    if (days < 0) status = 'CADUCADO';
                    else if (days <= 2) status = 'URGENTE';
                    else if (days <= 15) status = 'PRONTO';
                    else if (days <= 30) status = 'ATENCIÓN';

                    return [
                        getCategoryName(mat.categoria),
                        mat.nombre.substring(0, 35),
                        formatDate(mat.fecha_inicio),
                        formatDate(mat.fecha_caducidad),
                        days < 0 ? `${Math.abs(days)} días` : `${days} días`,
                        status,
                        (mat.responsable || '-').substring(0, 15),
                        (mat.furgoneta || '-').substring(0, 15)
                    ];
                });

            // Encabezados de tabla
            const headers = ['Categoría', 'Documento', 'Emisión', 'Caducidad', 'Días', 'Estado', 'Responsable', 'Ubicación'];

            doc.autoTable({
                startY: 75,
                head: [headers],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [227, 30, 36],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                bodyStyles: {
                    fontSize: 7
                },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 45 },
                    2: { cellWidth: 18 },
                    3: { cellWidth: 18 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 18 },
                    6: { cellWidth: 22 },
                    7: { cellWidth: 22 }
                },
                didParseCell: function(data) {
                    // Colorear según el estado
                    if (data.section === 'body' && data.column.index === 5) {
                        const value = data.cell.raw;
                        if (value === 'CADUCADO') {
                            data.cell.styles.textColor = [227, 30, 36];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (value === 'URGENTE') {
                            data.cell.styles.textColor = [253, 126, 20];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (value === 'PRONTO' || value === 'ATENCIÓN') {
                            data.cell.styles.textColor = [184, 134, 11];
                        } else {
                            data.cell.styles.textColor = [0, 184, 148];
                        }
                    }
                }
            });

            // Leyenda
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Leyenda de estados:', 14, finalY);
            doc.setTextColor(0, 184, 148);
            doc.text('OK - Válido', 14, finalY + 5);
            doc.setTextColor(184, 134, 11);
            doc.text('ATENCIÓN/PRONTO - Caduca en 30 días o menos', 45, finalY + 5);
            doc.setTextColor(253, 126, 20);
            doc.text('URGENTE - Caduca en 2 días o menos', 14, finalY + 10);
            doc.setTextColor(227, 30, 36);
            doc.text('CADUCADO - Ya ha caducado', 14, finalY + 15);
        } else {
            // Generar PDF simple sin tabla automática
            let yPos = 80;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            materials.forEach((mat, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                const days = getDaysUntilExpiry(mat.fecha_caducidad);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${getCategoryName(mat.categoria)}`, 14, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(mat.nombre.substring(0, 50), 14, yPos + 5);
                doc.text(`Emisión: ${formatDate(mat.fecha_inicio)} | Caducidad: ${formatDate(mat.fecha_caducidad)} | Días: ${days}`, 14, yPos + 10);
                yPos += 18;
            });
        }

        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Redes Carreras SL - Control Documental v1.0', 14, 290);
        doc.text('Página 1 de 1', 180, 290);

        // Guardar PDF
        const fileName = `Redes_Carreras_Control_Documental_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        showToast('PDF generado correctamente', 'success');
    } catch (error) {
        console.error('Error generando PDF:', error);
        showToast('Error al generar PDF. Por favor, intenta de nuevo.', 'error');
    }
}

// ============================================
// PWA
// ============================================

/**
 * Inicializa el Service Worker y PWA
 */
function initializePWA() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        // Verificar que estamos en un contexto seguro (http/https)
        // Los service workers no funcionan con protocolo file://
        if (location.protocol === 'file:') {
            console.log('Service Worker no disponible en protocolo file://. Usa HTTP para activar PWA.');
        } else {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration.scope);
                })
                .catch(error => {
                    // Error esperado si no se puede registrar (offline, contexto no seguro, etc.)
                    console.log('Service Worker no disponible:', error.message);
                });
        }
    }

    // Detectar instalación PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('btnInstall').classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        document.getElementById('btnInstall').classList.add('hidden');
        showToast('Aplicación instalada correctamente', 'success');
    });
}

/**
 * Instala la aplicación PWA
 */
function installPWA() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Usuario aceptó la instalación');
        }
        deferredPrompt = null;
    });
}

// ============================================
// BACKUP Y RESTAURACIÓN
// ============================================

/**
 * Exporta todos los documentos a un archivo JSON
 */
function exportBackup() {
    try {
        const backupData = {
            version: '2.0.0',
            exportDate: new Date().toISOString(),
            appName: 'Redes Carreras SL - Control Documental',
            totalDocuments: materials.length,
            documents: materials
        };

        // Convertir a JSON con formato bonito
        const jsonString = JSON.stringify(backupData, null, 2);
        
        // Crear blob y descargar
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `Redes_Carreras_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(`Backup exportado (${materials.length} documentos)`, 'success');
    } catch (error) {
        console.error('Error al exportar backup:', error);
        showToast('Error al exportar el backup', 'error');
    }
}

/**
 * Maneja la selección del archivo de importación
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            importBackup(data);
        } catch (error) {
            console.error('Error al leer archivo:', error);
            showToast('Error: El archivo no es válido', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

/**
 * Importa documentos desde un backup
 */
function importBackup(data) {
    // Validar estructura del backup
    if (!data.documents || !Array.isArray(data.documents)) {
        showToast('Error: Formato de backup inválido', 'error');
        return;
    }
    
    // Contar documentos válidos
    const validDocuments = data.documents.filter(doc => 
        doc.id && 
        doc.categoria && 
        doc.nombre && 
        doc.fecha_inicio && 
        doc.fecha_caducidad
    );
    
    if (validDocuments.length === 0) {
        showToast('Error: No hay documentos válidos en el backup', 'error');
        return;
    }
    
    // Preguntar si quiere añadir a los existentes o reemplazar
    const action = confirm(
        `Se encontraron ${validDocuments.length} documentos válidos en el backup.\n\n` +
        `¿Deseas AÑADIR estos documentos a los existentes?\n` +
        `Cancela para REEMPLAZAR todos los documentos actuales.`
    );
    
    if (action) {
        // Añadir al existente
        const newDocuments = validDocuments.map(doc => ({
            ...doc,
            id: generateId(), // Nuevos IDs para evitar conflictos
            nombre: doc.nombre + ' (Importado)'
        }));
        materials = [...materials, ...newDocuments];
        showToast(`Añadidos ${newDocuments.length} documentos`, 'success');
    } else {
        // Reemplazar
        if (confirm('¿Estás seguro? Se eliminarán todos los documentos actuales.')) {
            materials = validDocuments;
            showToast(`Restaurados ${materials.length} documentos`, 'success');
        } else {
            showToast('Importación cancelada', 'info');
            return;
        }
    }
    
    // Guardar y actualizar UI
    saveMaterials();
    renderMaterials();
    updateStats();
    checkExpiringItems();
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Obtiene una fecha relativa a hoy
 */
function getRelativeDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Muestra un toast de notificación
 */
function showToast(message, type = 'info') {
    // Eliminar toast anterior si existe
    const existingToast = document.querySelector('.toast-container');
    if (existingToast) {
        existingToast.remove();
    }

    const container = document.createElement('div');
    container.className = 'toast-container';
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    document.body.appendChild(container);

    setTimeout(() => {
        container.remove();
    }, 3000);
}

// ============================================
// ACTUALIZACIÓN PERIÓDICA
// ============================================

// Verificar caducidades cada hora
setInterval(() => {
    checkExpiringItems();
    renderMaterials();
    updateStats();
}, 3600000);

// Verificar al cambiar de pestaña
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkExpiringItems();
        renderMaterials();
        updateStats();
    }
});
