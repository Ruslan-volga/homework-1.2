#!/usr/bin/env node
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const min = 0;
const max = 100;
const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;

console.log(`Загадано число в диапазоне от ${min} до ${max}`);

rl.on('line', (input) => {
  const guess = parseInt(input);
  
  if (isNaN(guess)) {
    console.log('Пожалуйста, введите число');
    return;
  }

  if (guess < secretNumber) {
    console.log('Больше');
  } else if (guess > secretNumber) {
    console.log('Меньше');
  } else {
    console.log(`Отгадано число ${secretNumber}`);
    rl.close();
  }
}).on('close', () => {
  process.exit(0);
});