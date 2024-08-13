// Sample data structure
let habits = [];
let theme = 'light';

// Helper function to load content
function loadContent(content) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = content;
}

// Dashboard content
function loadDashboard() {
    const totalHabits = habits.length;
    const totalCompleted = habits.reduce((sum, habit) => sum + habit.completed, 0);
    const dashboardContent = `
        <div class="card">
            <h2>Dashboard</h2>
            <p>Total Habits: ${totalHabits}</p>
            <p>Total Completed: ${totalCompleted}</p>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${totalHabits ? (totalCompleted / totalHabits) * 100 : 0}%;"></div>
            </div>
        </div>
    `;
    loadContent(dashboardContent);
}

// Habits management content
function loadHabits() {
    const categories = ['Health', 'Productivity', 'Learning', 'Personal'];
    const habitsContent = `
        <div class="card">
            <h2>Manage Habits</h2>
            <input type="text" id="habitInput" placeholder="Add a new habit">
            <select id="categorySelect">
                ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
            </select>
            <button onclick="addHabit()">Add Habit</button>
            <ul id="habitList"></ul>
        </div>
    `;
    loadContent(habitsContent);
    displayHabits();
}

// Function to add a habit
function addHabit() {
    const habitInput = document.getElementById('habitInput');
    const categorySelect = document.getElementById('categorySelect');
    const newHabit = habitInput.value.trim();
    const category = categorySelect.value;

    if (newHabit) {
        habits.push({
            name: newHabit,
            category: category,
            completed: 0,
            streak: 0
        });
        habitInput.value = '';
        displayHabits();
        saveHabits();
    }
}

// Function to display habits
function displayHabits() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML = habits.map((habit, index) => `
        <li>
            <strong>${habit.name}</strong> (${habit.category})
            <p>Streak: ${habit.streak} days</p>
            <p>Completed: ${habit.completed} times</p>
            <button onclick="completeHabit(${index})">Complete</button>
            <button onclick="removeHabit(${index})">Remove</button>
        </li>
    `).join('');
}

// Function to complete a habit
function completeHabit(index) {
    habits[index].completed++;
    habits[index].streak++;
    displayHabits();
    saveHabits();
}

// Function to remove a habit
function removeHabit(index) {
    habits.splice(index, 1);
    displayHabits();
    saveHabits();
}

// Function to save habits to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Function to load habits from localStorage
function loadHabitsFromStorage() {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
        habits = JSON.parse(storedHabits);
    }
}

// Function to change the theme
function changeTheme(newTheme) {
    document.body.className = newTheme;
    theme = newTheme;
    localStorage.setItem('theme', theme);
}

// Function to load theme from localStorage
function loadThemeFromStorage() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        changeTheme(storedTheme);
    } else {
        changeTheme(theme);
    }
}

// Analytics content
function loadAnalytics() {
    const totalCompleted = habits.reduce((sum, habit) => sum + habit.completed, 0);
    const analyticsContent = `
        <div class="card">
            <h2>Analytics</h2>
            <p>Total Completed Habits: ${totalCompleted}</p>
            <ul>
                ${habits.map(habit => `
                    <li>${habit.name}: ${habit.completed} times</li>
                `).join('')}
            </ul>
        </div>
    `;
    loadContent(analyticsContent);
}

// Settings content
function loadSettings() {
    const settingsContent = `
        <div class="card">
            <h2>Settings</h2>
            <p>Customize your tracker settings here.</p>
            <button onclick="resetHabits()">Reset All Habits</button>
        </div>
    `;
    loadContent(settingsContent);
}

// Function to reset all habits
function resetHabits() {
    if (confirm("Are you sure you want to reset all habits? This cannot be undone.")) {
        habits = [];
        saveHabits();
        loadHabits();
    }
}

// Initialize app
function init() {
    loadHabitsFromStorage();
    loadThemeFromStorage();
    loadDashboard();

    document.getElementById('dashboardLink').addEventListener('click', () => loadDashboard());
    document.getElementById('habitsLink').addEventListener('click', () => loadHabits());
    document.getElementById('analyticsLink').addEventListener('click', () => loadAnalytics());
    document.getElementById('settingsLink').addEventListener('click', () => loadSettings());

    document.getElementById('theme').addEventListener('change', (event) => changeTheme(event.target.value));
}

init();
