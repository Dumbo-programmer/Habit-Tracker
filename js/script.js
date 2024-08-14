
// Utility Functions
function encryptData(data) {
    const utf8Data = new TextEncoder().encode(JSON.stringify(data));
    // Convert the Uint8Array to a Base64 string directly
    return btoa(String.fromCharCode.apply(null, utf8Data)); 
}

function decryptData(data) {
    try {
        return JSON.parse(atob(data)); // Directly parse the decoded Base64 string
    } catch (e) {
        console.error("Failed to decode data:", e);
        return null; 
    }
}

function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? decryptData(data) : null;
}

function saveToStorage(key, data) {
    localStorage.setItem(key, encryptData(data));
}

// Initial Setup
let habits = loadFromStorage('habits') || [];
let categories = loadFromStorage('categories') || ['Health', 'Productivity', 'Leisure'];
let reminders = loadFromStorage('reminders') || [];

// Habit Constructor
function Habit(name, category, reminderTime) {
    this.name = name;
    this.category = category;
    this.reminderTime = reminderTime;
    this.completions = [];
    this.streak = 0;
    this.id = Date.now();
}

function addHabit(name, category, reminderTime) {
    const newHabit = new Habit(name, category, reminderTime);
    habits.push(newHabit);
    saveToStorage('habits', habits);
    renderHabits();
    scheduleReminder(newHabit);
}

// Reminder Functionality
function scheduleReminder(habit) {
    if (habit.reminderTime) {
        const reminder = {
            habitId: habit.id,
            time: habit.reminderTime,
            intervalId: setInterval(() => {
                const now = new Date();
                if (now.getHours() === parseInt(habit.reminderTime.split(':')[0]) &&
                    now.getMinutes() === parseInt(habit.reminderTime.split(':')[1])) {
                    alert(`Reminder: Don't forget to complete your habit: ${habit.name}`);
                }
            }, 60000) // Checks every minute
        };
        reminders.push(reminder);
        saveToStorage('reminders', reminders);
    }
}

// Habit Completion Logic with Streak Tracking
function completeHabit(id) {
    const habit = habits.find(h => h.id === id);
    const today = new Date().toISOString().split('T')[0];

    if (!habit.completions.includes(today)) {
        habit.completions.push(today);
        habit.streak = calculateStreak(habit.completions);
        saveToStorage('habits', habits);
        renderHabits();
    }
}

function calculateStreak(completions) {
    const sortedDates = completions.sort((a, b) => new Date(a) - new Date(b));
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else if (diffDays > 1) {
            streak = 1;
        }
    }
    return streak;
}

// Data Visualization: Habit Progress Chart
function renderHabitProgressChart() {
    const canvas = document.getElementById('habitChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const habitNames = habits.map(habit => habit.name);
    const streaks = habits.map(habit => habit.streak);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: habitNames,
            datasets: [{
                label: 'Streak Length',
                data: streaks,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Drag-and-Drop Habit Reordering
function initDragAndDrop() {
    const habitItems = document.querySelectorAll('.habit-item');

    habitItems.forEach(item => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', drop);
    });
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.id);
    event.target.classList.add('dragging');
}

function dragEnd(event) {
    event.target.classList.remove('dragging');
}

function dragOver(event) {
    event.preventDefault();
    const dragging = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(event.target.closest('.habit-list'), event.clientY);
    if (afterElement == null) {
        event.target.closest('.habit-list').appendChild(dragging);
    } else {
        event.target.closest('.habit-list').insertBefore(dragging, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.habit-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function drop(event) {
    const id = event.dataTransfer.getData('text');
    const droppedElement = document.querySelector(`[data-id='${id}']`);
    event.target.closest('.habit-list').insertBefore(droppedElement, event.target.closest('.habit-item'));
    saveNewOrder();
}

function saveNewOrder() {
    const reorderedHabits = [];
    document.querySelectorAll('.habit-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        const habit = habits.find(h => h.id === id);
        reorderedHabits.push(habit);
    });
    habits = reorderedHabits;
    saveToStorage('habits', habits);
}

// Modal Management
function showEditModal(id) {
    const modal = document.getElementById('editModal');
    const overlay = document.getElementById('modalOverlay');
    const habit = habits.find(h => h.id === id);

    document.getElementById('editHabitInput').value = habit.name;
    document.getElementById('editCategorySelect').innerHTML = categories.map(cat => 
        `<option value="${cat}" ${cat === habit.category ? 'selected' : ''}>${cat}</option>`
    ).join('');
    document.getElementById('editModal').dataset.id = id;

    modal.style.display = 'block';
    overlay.style.display = 'block';
}


function closeEditModal() {
    const modal = document.getElementById('editModal');
    const overlay = document.getElementById('modalOverlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
}

function saveHabitEdits() {
    const id = parseInt(document.getElementById('editModal').dataset.id);
    const name = document.getElementById('editHabitInput').value;
    const category = document.getElementById('editCategorySelect').value;

    const habit = habits.find(h => h.id === id);
    habit.name = name;
    habit.category = category;

    saveToStorage('habits', habits);
    renderHabits();
    closeEditModal();
}

// Dynamic Content Loading
function loadDashboard() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="card">
            <h2>Welcome to your Dashboard</h2>
            <p>Track your habits and see your progress over time.</p>
            <canvas id="habitChart" width="400" height="200"></canvas>
        </div>
    `;
    renderHabitProgressChart();
}

function loadHabits() {
    const content = document.getElementById('mainContent');
    console.log(habits);
    content.innerHTML = `
        <div class="habit-list">
            ${habits.map(habit => `
                <div class="habit-item" data-id="${habit.id}" draggable="true">
                    <div class="habit-info">
                        <strong>${habit.name}</strong>
                        <p>Category: ${habit.category}</p>
                        <p>Streak: ${habit.streak}</p>
                    </div>
                    <div class="habit-actions">
                        <button onclick="completeHabit(${habit.id})">Complete</button>
                        <button onclick="showEditModal(${habit.id})">Edit</button>
                        <button onclick="removeHabit(${habit.id})">Remove</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    initDragAndDrop();
}

function loadAnalytics() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="card">
            <h2>Habit Analytics</h2>
            <canvas id="habitChart" width="400" height="200"></canvas>
        </div>
    `;
    renderHabitProgressChart();
}

function loadSettings() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="card">
            <h2>Settings</h2>
            <p>Manage categories and reminders here.</p>
        </div>
    `;
}

// Event Listeners for Page Navigation
document.getElementById('dashboardLink').addEventListener('click', loadDashboard);
document.getElementById('habitsLink').addEventListener('click', loadHabits);
document.getElementById('analyticsLink').addEventListener('click', loadAnalytics);
document.getElementById('settingsLink').addEventListener('click', loadSettings);
//document.getElementById('closeModal').addEventListener('click', closeEditModal);
//document.getElementById('saveHabitEdits').addEventListener('click', saveHabitEdits);

// Initial Load
loadDashboard();
