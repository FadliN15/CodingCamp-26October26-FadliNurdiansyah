const balance = document.getElementById('balance');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const list = document.getElementById('list');
const themeToggle = document.getElementById('theme-toggle');
const sortSelect = document.getElementById('sort-select');

// Inisialisasi Data dari Local Storage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Chart.js Instance
let expenseChart;

// Toggle Dark Mode
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please add text and amount');
        return;
    }

    const transaction = {
        id: generateID(),
        text: text.value,
        amount: +amount.value,
        category: category.value,
        date: new Date().getTime()
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();

    text.value = '';
    amount.value = '';
}

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addTransactionDOM(transaction) {
    const item = document.createElement('li');
    
    if (transaction.amount > 50) {
        item.classList.add('highlight');
    }

    item.innerHTML = `
        <div>
            <strong>${transaction.text}</strong> <br>
            <small>${transaction.category}</small>
        </div>
        <div>
            $${transaction.amount.toFixed(2)}
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">Delete</button>
        </div>
    `;

    list.appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    balance.innerText = `$${total}`;
}

function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    const categoryTotals = {
        Food: 0,
        Transport: 0,
        Fun: 0
    };

    transactions.forEach(t => {
        if (categoryTotals[t.category] !== undefined) {
            categoryTotals[t.category] += t.amount;
        }
    });

    const dataValues = [categoryTotals.Food, categoryTotals.Transport, categoryTotals.Fun];

    if (expenseChart) {
        expenseChart.destroy(); 
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Fun'],
            datasets: [{
                data: dataValues,
                backgroundColor: ['#2ecc71', '#3498db', '#e67e22'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function getSortedTransactions() {
    const sortBy = sortSelect.value;
    const transactionsCopy = [...transactions];

    if (sortBy === 'amount-desc') {
        return transactionsCopy.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'category') {
        return transactionsCopy.sort((a, b) => a.category.localeCompare(b.category));
    } else {
        return transactionsCopy.sort((a, b) => b.date - a.date);
    }
}

function init() {
    list.innerHTML = '';
    const sortedTransactions = getSortedTransactions();
    sortedTransactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

form.addEventListener('submit', addTransaction);
sortSelect.addEventListener('change', init);

init();