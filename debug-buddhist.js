const date = new Date('2025-12-20T12:00:00Z');

const fmt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    calendar: 'buddhist'
});

const fmtThai = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'full',
    calendar: 'buddhist'
});

console.log('Latin:', fmt.format(date));
console.log('Thai:', fmtThai.format(date));
