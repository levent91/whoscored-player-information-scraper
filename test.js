const a = [
    { a: 1, b: 2 },
    { a: 1, b: 3 },
];

console.log(a.reduce(((r, c) => Object.assign(r, c)), {}))