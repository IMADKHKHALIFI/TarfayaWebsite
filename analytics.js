/* analytics.js */

// Helper function to format numbers
function formatNumber(n) {
    if (typeof n === 'string') {
        n = n.replace(/,/g, '').replace(/\s/g, '');
        n = parseFloat(n);
    }
    return (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Extract data from DATA_JSON
function extractData() {
    const data = {
        demographics: {},
        education: {},
        employment: {}
    };

    // Find tables
    const tables = DATA_JSON.tables;

    // Demographics
    const demoTable = tables.find(t => t.nom === "RENSEIGNEMENTS DEMOGRAPHIQUES");
    if (demoTable) {
        const provinceData = demoTable.sections.find(s => s.type === "Données par province");
        const communeData = demoTable.sections.find(s => s.type === "Données par commune");

        data.demographics.province = provinceData?.donnees || {};
        data.demographics.communes = communeData?.donnees || [];
    }

    // Education
    const eduTable = tables.find(t => t.nom === "EDUCATION");
    if (eduTable) {
        data.education.province = eduTable.sections.find(s => s.type === "PROVINCE TARFAYA")?.donnees || {};
        data.education.communes = eduTable.sections.filter(s => s.type.includes("Commune")).map(s => s.donnees);
    }

    // Employment
    const empTable = tables.find(t => t.nom === "EMPLOI");
    if (empTable) {
        data.employment.province = empTable.sections.find(s => s.type === "Province de Tarfaya")?.donnees || {};
        data.employment.communes = empTable.sections.filter(s => s.type.includes("Commune")).map(s => s.donnees);
    }

    return data;
}

// Initialize all visualizations
function initializeAnalytics() {
    const data = extractData();

    createSummaryCards(data);
    createEducationChart(data);
    createStudentsChart(data);
    createEmploymentChart(data);
    createPopulationChart(data);
    createComparisonTable(data);
}

// Create summary statistics cards
function createSummaryCards(data) {
    const container = document.getElementById('summaryCards');

    const cards = [
        {
            icon: 'fa-users',
            iconBg: 'rgba(59, 130, 246, 0.2)',
            iconColor: '#60a5fa',
            label: 'Population Totale',
            value: formatNumber(data.demographics.province.Population || 0),
            subtitle: '5 communes'
        },
        {
            icon: 'fa-school',
            iconBg: 'rgba(168, 85, 247, 0.2)',
            iconColor: '#c084fc',
            label: 'Établissements Scolaires',
            value: (data.education.province["Nombre d'établissements préscolaires"] || 0) +
                (data.education.province["Nombre d'établissements Primaire"] || 0) +
                (data.education.province["Nombre d'établissements collège"] || 0) +
                (data.education.province["Nombre d'établissements Lycée"] || 0),
            subtitle: 'Province de Tarfaya'
        },
        {
            icon: 'fa-briefcase',
            iconBg: 'rgba(249, 115, 22, 0.2)',
            iconColor: '#fb923c',
            label: 'Taux de Chômage',
            value: (data.employment.province["Taux de chômage (%)"] || 0) + '%',
            subtitle: 'Province'
        },
        {
            icon: 'fa-water',
            iconBg: 'rgba(6, 182, 212, 0.2)',
            iconColor: '#22d3ee',
            label: 'Littoral',
            value: data.demographics.province.Littoral || '0 Km',
            subtitle: 'Côte atlantique'
        }
    ];

    container.innerHTML = cards.map(card => `
    <div class="summary-card">
      <div class="summary-card-icon" style="background: ${card.iconBg}; color: ${card.iconColor};">
        <i class="fa-solid ${card.icon}"></i>
      </div>
      <div class="summary-card-label">${card.label}</div>
      <div class="summary-card-value">${card.value}</div>
      <div class="summary-card-subtitle">${card.subtitle}</div>
    </div>
  `).join('');
}

// Create education establishments chart
function createEducationChart(data) {
    const ctx = document.getElementById('educationChart').getContext('2d');

    const communes = data.education.communes;
    const labels = communes.map(c => {
        const name = c["Collectivités territoriales"] || '';
        return name.replace(/Commune (de |d')/i, '');
    });

    const datasets = [
        {
            label: 'Préscolaire',
            data: communes.map(c => c["Nombre d'établissements préscolaires"] || 0),
            backgroundColor: 'rgba(96, 165, 250, 0.8)',
            borderColor: 'rgba(96, 165, 250, 1)',
            borderWidth: 1
        },
        {
            label: 'Primaire',
            data: communes.map(c => c["Nombre d'établissements Primaire"] || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        },
        {
            label: 'Collège',
            data: communes.map(c => c["Nombre d'établissements collège"] || 0),
            backgroundColor: 'rgba(37, 99, 235, 0.8)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1
        },
        {
            label: 'Lycée',
            data: communes.map(c => c["Nombre d'établissements Lycée"] || 0),
            backgroundColor: 'rgba(30, 64, 175, 0.8)',
            borderColor: 'rgba(30, 64, 175, 1)',
            borderWidth: 1
        }
    ];

    new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } }
                },
                y: {
                    stacked: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } },
                    beginAtZero: true
                }
            }
        }
    });
}

// Create students enrollment chart
function createStudentsChart(data) {
    const ctx = document.getElementById('studentsChart').getContext('2d');

    const province = data.education.province;

    const labels = ['Préscolaire', 'Primaire', 'Collège', 'Lycée'];
    const filles = [
        province["Nombre des élèves Préscolaire -Fille-"] || 0,
        province["Nombre des élèves Primaire -Fille-"] || 0,
        province["Nombre des élèves collège -Fille-"] || 0,
        province["Nombre des élèves Lycée -Fille-"] || 0
    ];
    const garcons = [
        province["Nombre des élèves Préscolaire -Garçon-"] || 0,
        province["Nombre des élèves Primaire -Garçon-"] || 0,
        province["Nombre des élèves collège -Garçon-"] || 0,
        province["Nombre des élèves Lycée -Garçon-"] || 0
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Filles',
                    data: filles,
                    backgroundColor: 'rgba(236, 72, 153, 0.8)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Garçons',
                    data: garcons,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(236, 72, 153, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } },
                    beginAtZero: true
                }
            }
        }
    });
}

// Create employment chart
function createEmploymentChart(data) {
    const ctx = document.getElementById('employmentChart').getContext('2d');

    const communes = data.employment.communes;
    const labels = communes.map(c => {
        const name = c["Collectivités territoriales"] || '';
        return name.replace(/Commune (de |d')/i, '');
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: "Taux d'activité (%)",
                    data: communes.map(c => c["Taux d'activité des 15 ans et plus (%)"] || 0),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Taux de chômage (%)',
                    data: communes.map(c => c["Taux de chômage (%)"] || 0),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(34, 197, 94, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } },
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Create population comparison chart
function createPopulationChart(data) {
    const ctx = document.getElementById('populationChart').getContext('2d');

    const communes = data.demographics.communes;
    const labels = communes.map(c => {
        const name = c["Collectivités territoriales"] || '';
        return name.replace(/Commune (de |d')/i, '');
    });

    const populations = communes.map(c => {
        let pop = c.Population;
        if (typeof pop === 'string') {
            pop = pop.replace(/,/g, '').replace(/\s/g, '');
            pop = parseFloat(pop);
        }
        return pop || 0;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Population',
                data: populations,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            return 'Population: ' + formatNumber(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: { size: 11 },
                        callback: function (value) {
                            return formatNumber(value);
                        }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Create comparison table
function createComparisonTable(data) {
    const table = document.getElementById('comparisonTable');

    const communes = data.demographics.communes;

    let html = `
    <thead>
      <tr>
        <th>Commune</th>
        <th>Population</th>
        <th>Masculin</th>
        <th>Féminin</th>
        <th>Superficie (Km²)</th>
        <th>Ménages</th>
        <th>Littoral</th>
        <th>Établissements</th>
        <th>Taux Chômage</th>
      </tr>
    </thead>
    <tbody>
  `;

    communes.forEach((commune, idx) => {
        const name = (commune["Collectivités territoriales"] || '').replace(/Commune (de |d')/i, '');
        const eduCommune = data.education.communes[idx] || {};
        const empCommune = data.employment.communes.find(e =>
            e["Collectivités territoriales"]?.toLowerCase().includes(name.toLowerCase())
        ) || {};

        const totalEtab =
            (eduCommune["Nombre d'établissements préscolaires"] || 0) +
            (eduCommune["Nombre d'établissements Primaire"] || 0) +
            (eduCommune["Nombre d'établissements collège"] || 0) +
            (eduCommune["Nombre d'établissements Lycée"] || 0);

        html += `
      <tr>
        <td class="commune-name">${name}</td>
        <td>${formatNumber(commune.Population)}</td>
        <td>${commune.Masculin}%</td>
        <td>${commune.Féminin}%</td>
        <td>${formatNumber(commune["Superficie (Km²)"])}</td>
        <td>${formatNumber(commune["Nombre ménage"])}</td>
        <td>${commune.Littoral}</td>
        <td>${totalEtab}</td>
        <td>${empCommune["Taux de chômage (%)"] || '—'}%</td>
      </tr>
    `;
    });

    html += '</tbody>';
    table.innerHTML = html;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAnalytics);
