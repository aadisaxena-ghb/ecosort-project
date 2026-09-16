document.addEventListener('DOMContentLoaded', () => {
  const forestGreen = '#2B4F38';
  const moss = '#6E9B4E';
  const amber = '#D98F2B';
  const slate = '#55507A';
  const muted = '#5C6B58';

  const compositionCtx = document.getElementById('compositionChart');
  if(compositionCtx && window.Chart){
    new Chart(compositionCtx, {
      type: 'bar',
      data: {
        labels: ['Hazardous', 'Plastic', 'E-Waste', 'Biomedical'],
        datasets: [{
          label: 'Million tonnes / year',
          data: [7.9, 5.6, 1.5, 0.17],
          backgroundColor: [amber, moss, slate, '#A5462C'],
          borderRadius: 6,
          maxBarThickness: 46,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#EAF0E4' }, ticks: { color: muted, font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { color: muted, font: { size: 11 } } }
        }
      }
    });
  }

  const delhiCtx = document.getElementById('delhiChart');
  if(delhiCtx && window.Chart){
    new Chart(delhiCtx, {
      type: 'bar',
      data: {
        labels: ['NDMC', 'MCD'],
        datasets: [{
          label: 'Source segregation rate (%)',
          data: [93, 59],
          backgroundColor: [forestGreen, '#C3D3BA'],
          borderRadius: 6,
          maxBarThickness: 70,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: '#EAF0E4' }, ticks: { color: muted, font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { color: muted, font: { size: 12 } } }
        }
      }
    });
  }
});
