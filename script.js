   // Array para almacenar todas las tareas
        let tasks = [];
        let taskIdCounter = 1;
        let showingCompletedTasks = false;
        let editingTaskId = null;

        // Función para generar un ID único
        function generateId() {
            return taskIdCounter++;
        }

        function addTask(title, description, subject, priority, dueDate, dueTime) {
            const task = {
                id: editingTaskId || generateId(),
                title: title,
                description: description,
                subject: subject,
                priority: priority,
                dueDate: dueDate,
                dueTime: dueTime,
                completed: false,
                createdAt: new Date().toLocaleDateString()
            };
            
            if (editingTaskId) {
                const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
                if (taskIndex !== -1) {
                    // Preserve the completed status and creation date of the original task
                    const originalTask = tasks[taskIndex];
                    task.completed = originalTask.completed;
                    task.createdAt = originalTask.createdAt;
                    tasks[taskIndex] = task;
                    showNotification('✏️ Tarea editada exitosamente', 'success');
                }
                editingTaskId = null;
                document.getElementById('cancelEditBtn').style.display = 'none';
                document.querySelector('.task-form h3').textContent = '➕ Agregar Nueva Tarea';
            } else {
                tasks.push(task);
                showNotification('✅ Tarea agregada exitosamente', 'success');
            }
            
            updateStats();
            renderTasks();
        }

        // Función para eliminar una tarea
        function deleteTask(id) {
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                tasks = tasks.filter(task => task.id !== id);
                updateStats();
                renderTasks();
                showNotification('🗑️ Tarea eliminada', 'info');
            }
        }

        // Función para marcar tarea como completada/pendiente
        function toggleTask(id) {
            const task = tasks.find(task => task.id === id);
            if (task) {
                task.completed = !task.completed;
                updateStats();
                renderTasks();
                
                if (task.completed) {
                    showNotification('🎉 ¡Tarea completada!', 'success');
                } else {
                    showNotification('📝 Tarea marcada como pendiente', 'info');
                }
            }
        }

        function editTask(id) {
            const task = tasks.find(task => task.id === id);
            if (task) {
                // Set editing mode
                editingTaskId = id;
                
                // Fill form with task data
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description;
                document.getElementById('taskSubject').value = task.subject;
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskDueDate').value = task.dueDate;
                document.getElementById('taskDueTime').value = task.dueTime || '';
                
                // Update UI to show editing mode
                document.querySelector('.task-form h3').textContent = '✏️ Editando Tarea';
                document.getElementById('cancelEditBtn').style.display = 'inline-block';
                
                // Scroll to form
                document.querySelector('.task-form').scrollIntoView({ behavior: 'smooth' });
            }
        }

        function cancelEdit() {
            editingTaskId = null;
            clearForm();
            document.getElementById('cancelEditBtn').style.display = 'none';
            document.querySelector('.task-form h3').textContent = '➕ Agregar Nueva Tarea';
        }

        // Función para actualizar las estadísticas
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(task => task.completed).length;
            const pending = total - completed;
            
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('pendingTasks').textContent = pending;
        }

        function renderTasks(tasksToRender = tasks) {
            const taskList = document.getElementById('taskList');
            
            // Filter out completed tasks for main list
            const pendingTasks = tasksToRender.filter(task => !task.completed);
            
            if (pendingTasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <h3>📋 No se encontraron tareas pendientes</h3>
                        <p>No hay tareas pendientes que coincidan con los filtros seleccionados</p>
                    </div>
                `;
            } else {
                taskList.innerHTML = pendingTasks.map(task => {
                    const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntilDue < 0 && !task.completed;
                    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && !task.completed;
                    
                    return `
                        <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority">
                            <div class="task-header">
                                <div>
                                    <div class="task-title">${task.title}</div>
                                    <div class="task-meta">
                                        <span>📚 ${capitalize(task.subject)}</span>
                                        <span class="priority-badge priority-${task.priority}">
                                            ${task.priority === 'high' ? '🔴 Alta' : task.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                                        </span>
                                        <span>📅 ${formatDate(task.dueDate)}</span>
                                        ${task.dueTime ? `<span>⏰ ${task.dueTime}</span>` : ''}
                                        ${isOverdue ? '<span style="color: red; font-weight: bold;">⚠️ VENCIDA</span>' : ''}
                                        ${isDueSoon ? '<span style="color: orange; font-weight: bold;">⏰ Próxima a vencer</span>' : ''}
                                    </div>
                                </div>
                            </div>
                            
                            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                            
                            <div class="task-actions">
                                <button class="btn btn-success" onclick="toggleTask(${task.id})">
                                    ${task.completed ? '↩️ Pendiente' : '✅ Completar'}
                                </button>
                                <button class="btn" onclick="editTask(${task.id})">✏️ Editar</button>
                                <button class="btn btn-danger" onclick="deleteTask(${task.id})">🗑️ Eliminar</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            renderCompletedTasks();
        }

        function renderCompletedTasks() {
            const completedTasksList = document.getElementById('completedTasksList');
            const completedCount = document.getElementById('completedCount');
            
            const completedTasks = tasks.filter(task => task.completed);
            completedCount.textContent = completedTasks.length;
            
            if (completedTasks.length === 0) {
                completedTasksList.innerHTML = `
                    <div class="empty-state">
                        <h3>🎉 No hay tareas completadas aún</h3>
                        <p>Las tareas que marques como completadas aparecerán aquí</p>
                    </div>
                `;
            } else {
                completedTasksList.innerHTML = completedTasks.map(task => `
                    <div class="task-item completed ${task.priority}-priority">
                        <div class="task-header">
                            <div>
                                <div class="task-title">${task.title}</div>
                                <div class="task-meta">
                                    <span>📚 ${capitalize(task.subject)}</span>
                                    <span class="priority-badge priority-${task.priority}">
                                        ${task.priority === 'high' ? '🔴 Alta' : task.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                                    </span>
                                    <span>📅 ${formatDate(task.dueDate)}</span>
                                    ${task.dueTime ? `<span>⏰ ${task.dueTime}</span>` : ''}
                                    <span style="color: green; font-weight: bold;">✅ COMPLETADA</span>
                                </div>
                            </div>
                        </div>
                        
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        
                        <div class="task-actions">
                            <button class="btn btn-success" onclick="toggleTask(${task.id})">
                                ↩️ Marcar Pendiente
                            </button>
                            <button class="btn btn-danger" onclick="deleteTask(${task.id})">🗑️ Eliminar</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        function toggleCompletedTasks() {
            const completedTasksList = document.getElementById('completedTasksList');
            const toggleIcon = document.getElementById('toggleIcon');
            
            showingCompletedTasks = !showingCompletedTasks;
            
            if (showingCompletedTasks) {
                completedTasksList.style.display = 'block';
                toggleIcon.textContent = '▲';
                toggleIcon.style.transform = 'rotate(180deg)';
            } else {
                completedTasksList.style.display = 'none';
                toggleIcon.textContent = '▼';
                toggleIcon.style.transform = 'rotate(0deg)';
            }
        }

        // Función para filtrar tareas
        function filterTasks() {
            const subjectFilter = document.getElementById('filterSubject').value;
            const priorityFilter = document.getElementById('filterPriority').value;
            const statusFilter = document.getElementById('filterStatus').value;
            const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
            
            let filteredTasks = tasks.filter(task => {
                const matchesSubject = !subjectFilter || task.subject === subjectFilter;
                const matchesPriority = !priorityFilter || task.priority === priorityFilter;
                const matchesStatus = !statusFilter || 
                    (statusFilter === 'completed' && task.completed) ||
                    (statusFilter === 'pending' && !task.completed);
                const matchesSearch = !searchTerm || 
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm);
                
                return matchesSubject && matchesPriority && matchesStatus && matchesSearch;
            });
            
            renderTasks(filteredTasks);
        }

        // Función para limpiar el formulario
        function clearForm() {
            document.getElementById('taskForm').reset();
        }

        // Función para mostrar notificaciones
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#4facfe'};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 1000;
                font-weight: 600;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Funciones auxiliares
        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Event listener para el formulario
        document.getElementById('taskForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const subject = document.getElementById('taskSubject').value;
            const priority = document.getElementById('taskPriority').value;
            const dueDate = document.getElementById('taskDueDate').value;
            const dueTime = document.getElementById('taskDueTime').value;
            
            addTask(title, description, subject, priority, dueDate, dueTime);
            clearForm();
        });

        // Establecer fecha mínima como hoy
        document.getElementById('taskDueDate').min = new Date().toISOString().split('T')[0];

        // Agregar estilos para animaciones
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Inicializar la aplicación
        updateStats();
        renderTasks();

        // Tareas de ejemplo (opcional - puedes eliminar esto)
        addTask(
            "Entregar ensayo de historia",
            "Escribir un ensayo de 1000 palabras sobre la Revolución Industrial",
            "historia",
            "high",
            "2025-09-15",
            "23:59"
        );
        
        addTask(
            "Estudiar para examen de matemáticas",
            "Repasar capítulos 5-8: ecuaciones cuadráticas y funciones",
            "matematicas",
            "medium",
            "2025-09-12",
            "14:30"
        );

        addTask(
            "Editar gestor de tareas de chaparro",
            "Ya está todo, no sé que toca hacer",
            "FrontEnd",
            "low",
            "2025-09-12",
            "18:00"
        );