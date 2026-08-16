const door = document.getElementById('door');
const earth = document.getElementById('earth');
const astralya = document.getElementById('astralya');
const instruction = document.getElementById('instruction');
const welcome = document.getElementById('welcome');
const welcomeLine = document.getElementById('welcome-line');
const welcomeSub = document.getElementById('welcome-sub');
const chartButton = document.getElementById('chart');

let opened = false;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function beginJourney() {
  if (opened) return;
  opened = true;
  door.classList.add('open');
  instruction.style.opacity = '0';

  await wait(1700);
  astralya.classList.add('awake');
  await wait(1400);
  earth.classList.add('leaving');
  await wait(2500);

  welcomeLine.textContent = 'Welcome, Stargazer.';
  welcome.classList.add('show-line');
  await wait(2300);

  welcomeSub.textContent = 'The stars have aligned.';
  welcome.classList.add('show-sub');
  await wait(2500);

  welcomeLine.textContent = 'Welcome home.';
  welcome.classList.remove('show-line');
  await wait(500);
  welcome.classList.add('show-line');
  await wait(2600);

  chartButton.classList.add('show-button');
}

door.addEventListener('click', beginJourney);
door.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    beginJourney();
  }
});

chartButton.addEventListener('click', () => {
  chartButton.textContent = 'Coming next';
  chartButton.disabled = true;
});
