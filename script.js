let barChartInstance;
let lineChartInstance;
const selectedGroups = new Set(['Property']); // ✅ Global now
const selectedFilters = {
  property: [],
  country: [],
  platform: [], 
  source: [],
  salesChannel: [],
  campaign: []
};
function updateKPICards(kpiData) {
  const kpiContainer = document.querySelector('.kpis');
  
  // Clear existing cards while preserving the container structure
  kpiContainer.innerHTML = '';
  
  // Define KPI configurations matching your design
  const kpiConfig = [
    {
      type: 'impressions',
      title: 'Impressions',
      cssClass: 'grey',
      valueFormatter: val => new Intl.NumberFormat('en-IN').format(val),
      trendFormatter: trend => ({
        symbol: trend >= 0 ? '▲' : '▼',
        cssClass: trend >= 0 ? 'up' : 'down',
        value: `${Math.abs(trend)}%`
      })
    },
    {
      type: 'revenue',
      title: 'Revenue',
      cssClass: 'blue',
      valueFormatter: val => `₹${new Intl.NumberFormat('en-IN').format(val)}`,
      trendFormatter: trend => ({
        symbol: trend >= 0 ? '▲' : '▼',
        cssClass: trend >= 0 ? 'up' : 'down',
        value: `${Math.abs(trend)}%`
      })
    },
    {
      type: 'unfill',
      title: 'Unfill (%)',
      cssClass: 'pink',
      valueFormatter: val => `${val}%`,
      trendFormatter: trend => ({
        symbol: '▲', // Always shows ▲ as per your design
        cssClass: 'exceptionup', // Special class for unfill
        value: `${trend}%`
      })
    },
    {
      type: 'pageViews',
      title: 'Page Views',
      cssClass: 'lightblue',
      valueFormatter: val => new Intl.NumberFormat('en-IN').format(val),
      trendFormatter: trend => ({
        symbol: trend >= 0 ? '▲' : '▼',
        cssClass: trend >= 0 ? 'up' : 'down',
        value: `${Math.abs(trend)}%`
      })
    },
    {
      type: 'ecpm',
      title: 'eCPM',
      cssClass: 'orange',
      valueFormatter: val => `₹${val.toFixed(2)}`, // Shows 2 decimal places
      trendFormatter: trend => ({
        symbol: trend >= 0 ? '▲' : '▼',
        cssClass: trend >= 0 ? 'up' : 'down',
        value: `${Math.abs(trend)}%`
      })
    }
  ];

  // Create each KPI card
  kpiConfig.forEach(config => {
    const kpi = kpiData[config.type];
    if (!kpi) return; // Skip if no data for this KPI

    const trendData = config.trendFormatter(kpi.trend);
    
    const card = document.createElement('div');
    card.className = `kpi ${config.cssClass}`;
    card.innerHTML = `
      ${config.title}<br>
      <span>${config.valueFormatter(kpi.value)}</span>
      <p class="${trendData.cssClass}">${trendData.symbol} ${trendData.value}</p>
      <p><small>(${kpi.currentDateRange} vs ${kpi.compareDateRange})</small></p>
    `;
    
    kpiContainer.appendChild(card);
  });

  // If no data came through, show message
  if (Object.keys(kpiData).length === 0) {
    kpiContainer.innerHTML = '<div class="no-data">No KPI data available</div>';
  }
}
function getBarChartConfig() {
  // Your chart config here
  return {
    type: 'bar',
    data: { /* ... */ },
    options: { /* ... */ }
  };
}
function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// 5. KPI card updater
function updateKPICards(kpiData) {
  document.querySelectorAll('.kpi').forEach((card, index) => {
    const kpi = kpiData[index];
    card.querySelector('span').textContent = kpi.value;
    card.querySelector('.trend').className = `trend ${kpi.trend > 0 ? 'up' : 'down'}`;
    card.querySelector('.trend').textContent = 
      `${kpi.trend > 0 ? '▲' : '▼'} ${Math.abs(kpi.trend)}%`;
    card.querySelector('small').textContent = 
      `(${kpi.currentDateRange} vs ${kpi.compareDateRange})`;
  });
}
function updateFreezeTextLabels(mainRange, compareRange, compareEnabled) {
  // Get all elements with the 'freeze-text' class
  const freezeTextElements = document.querySelectorAll('.freeze-text');
  
  freezeTextElements.forEach(element => {
    // Update main date range display
    if (element.dataset.type === 'main-range') {
      element.textContent = mainRange || 'No date range selected';
    }
    // Update compare range display
    else if (element.dataset.type === 'compare-range') {
      element.textContent = compareEnabled ? (compareRange || 'No compare range') : 'Comparison disabled';
    }
  });
}
function setupAddFilterDropdown(data) {
  document.querySelectorAll('#filterDropdown a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const filterType = this.dataset.filterType;
      
      // Create dropdown if it doesn't exist
      if (!document.getElementById(`${filterType}Dropdown`)) {
        const dropdownHTML = `
          <div class="dropdown">
            <button class="btn ${filterType}" id="${filterType}Btn">
              ${this.textContent} ▼
            </button>
            <div class="dropdown-content hidden" id="${filterType}Dropdown"></div>
          </div>
        `;
        document.querySelector('.filter-buttons').insertAdjacentHTML('beforeend', dropdownHTML);
        
        // Reinitialize dropdown behavior
        setupDropdownBehavior();
      }
      
      // Initialize the dropdown
      if (data[filterType]) {
        initDropdown(filterType, data[filterType]);
      }
      
      // Close the "Add Filter" dropdown
      document.getElementById('filterDropdown').classList.add('hidden');
    });
  });
}
function setupDropdownBehavior() {
  document.querySelectorAll('.dropdown .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdown = this.nextElementSibling;
      if (!dropdown) return;
      
      document.querySelectorAll('.dropdown-content').forEach(d => {
        if (d !== dropdown) d.classList.add('hidden');
      });
      dropdown.classList.toggle('hidden');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-content').forEach(d => {
      d.classList.add('hidden');
    });
  });
}
function renderActiveFilters() {
  const container = document.getElementById('activeFilters');
  container.innerHTML = '';
  
  Object.entries(selectedFilters).forEach(([type, values]) => {
    values.forEach(value => {
      const chip = document.createElement('div');
      chip.className = 'filter-chip';
      chip.innerHTML = `
        ${type}: ${value}
        <button onclick="removeFilter('${type}', '${value}')">×</button>
      `;
      container.appendChild(chip);
    });
  });
}
window.removeFilter = function(type, value) {
  selectedFilters[type] = selectedFilters[type].filter(v => v !== value);
  renderActiveFilters();
  
  const dropdown = document.getElementById(`${type}Dropdown`);
  if (dropdown) {
    const checkbox = dropdown.querySelector(`input[value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  }
};

function updateButtonStates() {
  document.querySelectorAll('.group-btn').forEach(btn => {
    const value = btn.dataset.value;
    btn.classList.toggle('selected', selectedGroups.has(value));
  });
}
 
document.addEventListener('DOMContentLoaded', function() {
  // 1. Initialize Chart
  const initChart = () => {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    return new Chart(ctx, getBarChartConfig());
  };
   const filterForm = document.getElementById("filterForm");
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
    });
  }
  
  let barChartInstance = initChart();

  // 2. Date Handling Utilities
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  const setDefaultDates = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  };

  // 3. Date Range Initialization
  const initDateRanges = () => {
    const defaultDate = setDefaultDates();
    
    const dateRange1 = flatpickr("#dateRange1", {
      mode: "range",
      defaultDate: [defaultDate, defaultDate],
      onChange: function(selectedDates) {
        if (selectedDates.length === 2) {
          updateDashboard({
            dateRange1: `${formatDate(selectedDates[0])} to ${formatDate(selectedDates[1])}`,
            compareEnabled: document.getElementById('enableCompare').checked
          });
        }
      }
    });

    const dateRange2 = flatpickr("#dateRange2", {
      mode: "range"
    });

    document.getElementById('enableCompare').addEventListener('change', function() {
      dateRange2._input.disabled = !this.checked;
      if (!this.checked) dateRange2.clear();
      updateDashboard(getCurrentFilters());
    });

    return {
      dateRange1,
      dateRange2
    };
  };

  const datePickers = initDateRanges();

  // 4. Dashboard Data Management
  const getCurrentFilters = () => {
    return {
      dateRange1: document.getElementById('dateRange1').value,
      compareEnabled: document.getElementById('enableCompare').checked,
      compareRange: document.getElementById('dateRange2').value,
      // Add your other filter values here
    };
  };

  const updateDashboard = async (params) => {
    try {
      const payload = {
        dateRange: params.dateRange1,
        compareRange: params.compareEnabled ? params.compareRange : null,
        filters: {} // Add your filters here
      };
      
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      // Update chart with new data
      barChartInstance.destroy();
      barChartInstance = initChart();
      
      // Update KPI cards
      updateKPICards(data.kpis);
      
    } catch (error) {
      console.error('Dashboard update failed:', error);
    }
  };

  // 5. Row Toggle Handling (Keep your existing functionality)
  document.querySelectorAll('.row-toggle').forEach(checkbox => {
    checkbox.addEventListener('click', function(e) {
      if (!this.checked) {
        e.preventDefault();
      }
    });
  });

  // 6. Initial Load
  updateDashboard({
    dateRange1: `${setDefaultDates()} to ${setDefaultDates()}`,
    compareEnabled: false
  });
});

// 2. Update when Apply is clicked
document.getElementById('applyBtn').addEventListener('click', function() {
  const dateRange1 = document.getElementById('dateRange1').value;
  const compareEnabled = document.getElementById('enableCompare').checked;
  const dateRange2 = compareEnabled ? document.getElementById('dateRange2').value : null;
  
  loadDashboardData({
    dateRange1: dateRange1,
    dateRange2: dateRange2,
    compareEnabled: compareEnabled,
    filters: getActiveFilters() // Get from your selectedFilters
  });
});


// Helpers
function populateCheckboxDropdown(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    items.forEach(item => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${item}"> ${item}`;
        container.appendChild(label);
    });
}

function getSelectedValues(containerSelector) {
    const checkboxes = document.querySelectorAll(`${containerSelector} input[type="checkbox"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

    
     document.querySelectorAll('.row-toggle').forEach(checkbox => {
        checkbox.addEventListener('click', function (e) {
            if (!this.checked) {
                e.preventDefault();
            }
        });
    });

    document.getElementById("liveMintToggle")?.addEventListener("click", function (event) {
        event.preventDefault();
        const details = document.getElementById("liveMintDetails");
        details?.classList.toggle("hidden");
    });
// Function to show bar chart
function showChart() {
    destroyChart();
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    barChartInstance = new Chart(ctx, getBarChartConfig());
}

// Function to show line chart
function showTable() {
    destroyChart();
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    lineChartInstance = new Chart(ctx, getLineChartConfig());
}

// Destroy existing chart if any
function destroyChart() {
    if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
    }
    if (lineChartInstance) {
        lineChartInstance.destroy();
        lineChartInstance = null;
    }
}

// Bar chart config (original chart)
function getBarChartConfig() {
    return {
        type: 'bar',
        data: {
            labels: [
                'Hindustan Times', 'Livemint', 'HT Tamil', 'HT Bangla', 'HT Productivity', 'HT Kannada'
            ],
            datasets: [
                {
                    label: 'Impressions (01-06-2025 - 14-06-2025)',
                    data: [2000000, 2500000, 500000, 2700000, 2600000, 900000],
                    backgroundColor: 'rgba(255, 72, 0, 0.96)',
                },
                {
                    label: 'Impressions (01-07-2025 - 14-07-2025)',
                    data: [2000000, 2500000, 500000, 2500000, 2600000, 900000],
                    backgroundColor: 'rgba(189, 64, 14, 0.89)',
                },
                {
                    label: 'Revenue (01-06-2025 - 14-06-2025)',
                    data: [3000000, 2800000, 200000, 2900000, 2700000, 1000000],
                    backgroundColor: 'rgba(255, 196, 0, 0.95)',
                },
                {
                    label: 'Revenue (01-07-2025 - 14-07-2025)',
                    data: [700000, 750000, 250000, 720000, 710000, 300000],
                    backgroundColor: 'rgba(255, 98, 0, 0.96)',
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        },
        options: getChartOptions()
    };
}

// Line chart config
function getLineChartConfig() {
    return {
        type: 'line',
        data: {
            labels: [
                'Hindustan Times', 'Livemint', 'HT Tamil', 'HT Bangla', 'HT Productivity', 'HT Kannada'
            ],
            datasets: [
                {
                    label: 'Impressions (01-06-2025 - 14-06-2025)',
                    data: [2000000, 2500000, 500000, 2700000, 2600000, 900000],
                    borderColor: 'rgba(255, 72, 0, 0.96)',
                    fill: false
                },
                {
                    label: 'Impressions (01-07-2025 - 14-07-2025)',
                    data: [2000000, 2500000, 500000, 2500000, 2600000, 900000],
                    borderColor: 'rgba(189, 64, 14, 0.89)',
                    fill: false
                },
                {
                    label: 'Revenue (01-06-2025 - 14-06-2025)',
                    data: [3000000, 2800000, 200000, 2900000, 2700000, 1000000],
                    borderColor: 'rgba(255, 196, 0, 0.95)',
                    fill: false
                },
                {
                    label: 'Revenue (01-07-2025 - 14-07-2025)',
                    data: [700000, 750000, 250000, 720000, 710000, 300000],
                    borderColor: 'rgba(255, 98, 0, 0.96)',
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: getChartOptions()
    };
}

// Shared chart options
function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: 'Impressions and Revenue Comparison by Property'
            }
        },
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: 'Impressions'
                }
            },
            y1: {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Revenue'
                },
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    };
}
document.getElementById('enableCompare')?.addEventListener('change', function () {
    const from2 = document.getElementById('dateFrom2');
    const to2 = document.getElementById('dateTo2');

   const disable = !this.checked;
    from2.disabled = disable;
    to2.disabled = disable;
});
 document.querySelectorAll('.freeze-toggle').forEach(checkbox => {
    const span = checkbox.nextElementSibling;
    if (!checkbox.checked) {
      span.classList.add('frozen');
    }

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        span.classList.remove('frozen');
      } else {
        span.classList.add('frozen');
      }
    });
  });
   function toggleDetails(row) {
  const levelClass = Array.from(row.classList).find(cls => cls.startsWith("level-"));
  const currentLevel = parseInt(levelClass?.split('-')[1]);

  let next = row.nextElementSibling;

  while (next) {
    const nextLevelClass = Array.from(next.classList).find(cls => cls.startsWith("level-"));
    const nextLevel = parseInt(nextLevelClass?.split('-')[1]);

    if (!nextLevelClass || nextLevel <= currentLevel) break;

    // Only show direct children
    if (nextLevel === currentLevel + 1) {
      next.classList.toggle('show');
    }

    next = next.nextElementSibling;
  }

  const icon = row.querySelector(".toggle-icon");
  if (icon) {
    icon.textContent = icon.textContent === "▶" ? "▼" : "▶";
  }
}
function showPopup(cell) {
  const popup = document.getElementById("customPopup");
  const content = document.getElementById("popupContent");

  // Set the popup content dynamically
  content.textContent = "Details for: " + cell.closest("tr").cells[0].innerText;

  // Get position of the clicked element
  const rect = cell.getBoundingClientRect();

  // Position popup near the clicked cell
  
}
// Store selected filters
// 1. Change window.onload to DOMContentLoaded and wrap in a main function
document.addEventListener('DOMContentLoaded', function() {
  initializeFilters();
  setupDropdownBehavior();
});

// 2. Update the initializeFilters function
async function initializeFilters() {
  try {
    const response = await fetch('http://localhost:5000/api/data/dropdowns');
    const data = await response.json();
    
    // Initialize standard dropdowns
    initDropdown('property', data.property || []);
    initDropdown('country', data.country || []);
    initDropdown('platform', data.platform || []);
    
    // Setup additional filters dropdown
    setupAddFilterDropdown(data);
    
  } catch (err) {
    console.error('Error loading filters:', err);
  }
}

// 3. Add this new function to handle "Add Filter" dropdown

// 4. Update initDropdown function
function initDropdown(type, items) {
  const dropdown = document.getElementById(`${type}Dropdown`);
  if (!dropdown) return;
  
  dropdown.innerHTML = items.map(item => `
    <label class="dropdown-item">
      <input type="checkbox" value="${item}" 
             data-filter-type="${type}"
             ${selectedFilters[type].includes(item) ? 'checked' : ''}>
      ${item}
    </label>
  `).join('');

  dropdown.querySelectorAll('input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateFilter(type, this.value, this.checked);
    });
  });
}
// 5. Update updateFilter function
function updateFilter(type, value, isChecked) {
  if (isChecked) {
    if (!selectedFilters[type].includes(value)) {
      selectedFilters[type].push(value);
    }
  } else {
    selectedFilters[type] = selectedFilters[type].filter(v => v !== value);
  }
  renderActiveFilters();
}
  // Add quick buttons like "Last 7 Days"
  function addButtonsToCalendar(fpInstance) {
    const buttons = [
      {
        label: "Yesterday",
        set: [new Date(Date.now() - 86400000), new Date(Date.now() - 86400000)]
      },
      {
        label: "Last 7 Days",
        set: [new Date(Date.now() - 6 * 86400000), new Date()]
      },
      {
        label: "Last 15 Days",
        set: [new Date(Date.now() - 14 * 86400000), new Date()]
      },
      {
        label: "Last Month",
        set: [
          new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        ]
      }
    ];

    fpInstance.config.onOpen.push(() => {
      setTimeout(() => {
        const cal = fpInstance.calendarContainer;
        if (!cal.querySelector(".quick-select")) {
          const btnContainer = document.createElement("div");
          btnContainer.className = "quick-select";
          buttons.forEach(btn => {
            const b = document.createElement("button");
            b.textContent = btn.label;
            b.onclick = () => {
              fpInstance.setDate(btn.set);
              fpInstance.close();
            };
            btnContainer.appendChild(b);
          });
          cal.appendChild(btnContainer);
        }
      }, 10);
    });
  }

  const fp1 = flatpickr("#dateRange1", {
    mode: "range",
    dateFormat: "Y-m-d",
    defaultDate: ["2025-07-01", "2025-07-14"]
  });
  addButtonsToCalendar(fp1);

  const fp2 = flatpickr("#dateRange2", {
    mode: "range",
    dateFormat: "Y-m-d",
    defaultDate: ["2025-06-01", "2025-06-14"]
  });
  addButtonsToCalendar(fp2);

  // Toggle compare calendar
  const compareCheckbox = document.getElementById("enableCompare");
  const compareInput = document.getElementById("dateRange2");
  compareInput.style.display = compareCheckbox.checked ? "inline-block" : "none";

  compareCheckbox.addEventListener("change", () => {
    compareInput.style.display = compareCheckbox.checked ? "inline-block" : "none";
  });

document.getElementById("applyBtn").addEventListener("click", () => {
  const mainRange = document.getElementById("dateRange1").value;
  const compareEnabled = document.getElementById("enableCompare").checked;
  const compareRange = compareEnabled ? document.getElementById("dateRange2").value : null;

  const selectedProperty = document.getElementById('propertyBtn').textContent.replace(" ▼", "");
  const selectedCountry = document.getElementById('countryBtn').textContent.replace(" ▼", "");
  const selectedPlatform = document.getElementById('platformBtn')?.textContent.replace(" ▼", "") || "";

  const payload = {
    dateRange: mainRange,
    compareRange: compareEnabled ? compareRange : null,
    filters: {
      property: selectedProperty,
      country: selectedCountry,
      platform: selectedPlatform
    }
  };

  console.log("Payload to send to API:", payload);

  updateFreezeTextLabels(mainRange, compareRange, compareEnabled);
  // fetchDataAndUpdateChart(payload); ← You’ll call this next
});

  function filterTable(groups) {
      const rows = document.querySelectorAll('#data-table tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let show = true;

        if (groups.has('Property') && !cells[0].textContent.trim()) show = false;
        if (groups.has('Country') && !cells[1].textContent.trim()) show = false;
        if (groups.has('Platform') && !cells[2].textContent.trim()) show = false;

        row.style.display = show ? '' : 'none';
      });
    }

   function exportVisibleTable(groups) {
  const table = document.querySelector('#data-table'); // Make sure this ID is correct
  if (!table) return;

  let csv = [];
  for (let row of table.rows) {
    let cols = Array.from(row.cells).map(cell => `"${cell.innerText}"`);
    csv.push(cols.join(','));
  }

  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `filtered_table_${Array.from(groups).join('_')}.csv`;
  a.click();
}
    // Button click logic
    document.querySelectorAll('.group-btn').forEach(button => {
      button.addEventListener('click', () => {
        const value = button.dataset.value;
        if (selectedGroups.has(value)) {
          selectedGroups.delete(value);
        } else {
          selectedGroups.add(value);
        }
        updateButtonStates();
      });
    });

   document.getElementById('reload-btn').addEventListener('click', () => {
  filterTable(selectedGroups);  // or your table refresh logic
});

document.getElementById('export-btn').addEventListener('click', () => {
  exportVisibleTable(selectedGroups);
});

    // Initial setup
    updateButtonStates();
    filterTable(selectedGroups);
    async function loadDashboardData(params) {
  try {
    // Build API request based on params
    const apiParams = {
      date_range: params.dateRange1,
      compare_date: params.compareEnabled ? params.dateRange2 : null,
      filters: params.filters || {}
    };
    
    // Fetch data
    const response = await fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiParams)
    });
    
    const data = await response.json();
    
    // Update KPIs
    updateKPICards(data.kpis);
    
    // Update charts if you have them
    updateCharts(data.charts);
    
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Failed to load dashboard data');
  }
}
async function loadInitialData() {
  try {
    const response = await fetch("/api/dashboard/initial");
    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
}

// Apply filters (calls /filtered POST API)
async function applyFilters() {
  const dateRange = document.getElementById("dateRange").value;
  const compareRange = document.getElementById("compareRange")?.value || null;

  // Add other filter inputs as needed
  const filters = {
    property: document.getElementById("property")?.value || "",
    // Add more filters if needed
  };

  try {
    const response = await fetch("/api/dashboard/filtered", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dateRange, compareRange, filters }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch filtered data");
    }

    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.error("Error applying filters:", error);
  }
}

// Render the dashboard (fill in your actual render logic)
function renderDashboard(data) {
  const output = document.getElementById("dashboardOutput");
  if (!output) return;

  output.innerHTML = `
    <h3>Dashboard Data</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}