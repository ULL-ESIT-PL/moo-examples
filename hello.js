const moo = require('moo')
const inspect = require('util').inspect;
const ins = (x) => console.log(inspect(x, {depth: null}));
debugger;

let lexer = moo.compile({
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    number: /0|[1-9][0-9]*/,
    string: /"(?:\\["\\]|[^\n"\\])*"/,
    lparen: '(',
    rparen: ')',
    keyword: ['while', 'if', 'else', 'moo', 'cow'],
    NL: { match: /\n/, lineBreaks: true },
});

lexer.reset(
//123456789AB
 'while (10) cow\nmoo'
)

console.log(lexer.next()) // -> { type: 'keyword', value: 'while' }
console.log(lexer.next()) // -> { type: 'WS', value: ' ' }
console.log(lexer.next()) // -> { type: 'lparen', value: '(' }
console.log(lexer.next()) // -> { type: 'number', value: '10' }
console.log(lexer.next()) // )
console.log(lexer.next()) // cows
console.log(lexer.next()) // "\n"
console.log(lexer.next()) // moo
console.log('result='+ins(lexer.next())) // undefined
console.log('result='+ins(lexer.next())) //
console.log('result='+ins(lexer.next())) //
