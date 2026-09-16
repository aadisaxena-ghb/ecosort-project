document.addEventListener('DOMContentLoaded', () => {
  // ---------- Interactive Household Impact Calculator ----------
  const slider = document.getElementById('householdSlider');
  const valLabel = document.getElementById('householdVal');
  const divertedEl = document.getElementById('calcDiverted');
  const co2El = document.getElementById('calcCo2');
  const compostEl = document.getElementById('calcCompost');

  if(slider){
    function updateCalculator(){
      const people = parseInt(slider.value, 10);
      valLabel.textContent = `${people} Person${people > 1 ? 's' : ''}`;

      // Average Indian urban waste generation: ~0.4 kg/person/day
      // Segregation diversion rate: ~0.35 kg/person/day saved from unmanaged landfill
      const kgDivertedYear = Math.round(people * 0.4 * 365);
      const kgCo2Year = Math.round(kgDivertedYear * 0.75); // 1 kg organic waste in landfill ~ 0.75kg CO2e methane equivalent
      const kgCompostYear = Math.round(kgDivertedYear * 0.5);

      divertedEl.textContent = `${kgDivertedYear.toLocaleString()} kg`;
      co2El.textContent = `${kgCo2Year.toLocaleString()} kg`;
      compostEl.textContent = `${kgCompostYear.toLocaleString()} kg`;
    }

    slider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  // ---------- Chart.js Visualizations ----------
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#EDF5EC' : '#16241A';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : '#EAF0E4';

  const forestGreen = '#3E734F';
  const moss = '#6E9B4E';
  const amber = '#D98F2B';
  const slate = '#673AB7';
  const hazardRed = '#D32F2F';

  const compositionCtx = document.getElementById('compositionChart');
  if(compositionCtx && window.Chart){
    new Chart(compositionCtx, {
      type: 'bar',
      data: {
        labels: ['Hazardous', 'Plastic', 'E-Waste', 'Biomedical'],
        datasets: [{
          label: 'Million tonnes / year',
          data: [7.9, 5.6, 1.5, 0.17],
          backgroundColor: [amber, moss, slate, hazardRed],
          borderRadius: 8,
          maxBarThickness: 46,
        }]
      },
      options: {
        responsive: true,
        plugins: { 
          legend: { display: false },
          tooltip: {
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: gridColor }, 
            ticks: { color: '#8FA48B', font: { size: 11 } } 
          },
          x: { 
            grid: { display: false }, 
            ticks: { color: '#8FA48B', font: { size: 11 } } 
          }
        }
      }
    });
  }

  const delhiCtx = document.getElementById('delhiChart');
  if(delhiCtx && window.Chart){
    new Chart(delhiCtx, {
      type: 'bar',
      data: {
        labels: ['NDMC (New Delhi)', 'MCD (Municipal Corp)'],
        datasets: [{
          label: 'Source Segregation Rate (%)',
          data: [93, 59],
          backgroundColor: [forestGreen, '#A9CB89'],
          borderRadius: 8,
          maxBarThickness: 55,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { 
          legend: { display: false },
          tooltip: {
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: { 
            beginAtZero: true, 
            max: 100, 
            grid: { color: gridColor }, 
            ticks: { 
              color: '#8FA48B', 
              font: { size: 11 },
              callback: (val) => val + '%'
            } 
          },
          y: { 
            grid: { display: false }, 
            ticks: { color: '#8FA48B', font: { size: 12 } } 
          }
        }
      }
    });
  }
});
