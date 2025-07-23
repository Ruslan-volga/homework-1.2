#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { formatISO, addDays, subDays, addMonths, subMonths, getYear, getMonth, getDate } = require('date-fns');

const argv = yargs(hideBin(process.argv))
  .command('current', 'Текущая дата и время', (yargs) => {
    return yargs
      .option('year', {
        alias: 'y',
        type: 'boolean',
        description: 'Текущий год'
      })
      .option('month', {
        alias: 'm',
        type: 'boolean',
        description: 'Текущий месяц'
      })
      .option('date', {
        alias: 'd',
        type: 'boolean',
        description: 'Дата в календарном месяце'
      })
  })
  .command('add', 'Добавить к текущей дате', (yargs) => {
    return yargs
      .option('days', {
        alias: 'd',
        type: 'number',
        description: 'Добавить дни'
      })
      .option('months', {
        alias: 'm',
        type: 'number',
        description: 'Добавить месяцы'
      })
  })
  .command('sub', 'Вычесть из текущей даты', (yargs) => {
    return yargs
      .option('days', {
        alias: 'd',
        type: 'number',
        description: 'Вычесть дни'
      })
      .option('months', {
        alias: 'm',
        type: 'number',
        description: 'Вычесть месяцы'
      })
  })
  .argv;

const now = new Date();

if (argv._.includes('current')) {
  if (argv.year || argv.y) {
    console.log(getYear(now));
  } else if (argv.month || argv.m) {
    console.log(getMonth(now) + 1); // +1 потому что месяцы 0-11
  } else if (argv.date || argv.d) {
    console.log(getDate(now));
  } else {
    console.log(formatISO(now));
  }
} else if (argv._.includes('add')) {
  let result = now;
  if (argv.days) {
    result = addDays(result, argv.days);
  }
  if (argv.months) {
    result = addMonths(result, argv.months);
  }
  console.log(formatISO(result));
} else if (argv._.includes('sub')) {
  let result = now;
  if (argv.days) {
    result = subDays(result, argv.days);
  }
  if (argv.months) {
    result = subMonths(result, argv.months);
  }
  console.log(formatISO(result));
}