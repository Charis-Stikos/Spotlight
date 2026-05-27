// Παραγόμενη εικόνα (gradient + αρχικό γράμμα) για παραστάσεις/θέατρα χωρίς αφίσα
const GRADIENTS = [
  ['#FF6B6B', '#FF8E53'],
  ['#FF6A88', '#A66BFF'],
  ['#7C4DFF', '#4D9FFF'],
  ['#FF5FA2', '#FFC371'],
  ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#A66BFF', '#FF6A88'],
];

function hash(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function gradientFor(seed = '') {
  return GRADIENTS[hash(String(seed)) % GRADIENTS.length];
}

export function initialFor(seed = '') {
  const match = String(seed).match(/[A-Za-z0-9]/);
  return match ? match[0].toUpperCase() : '★';
}
