const moo = require('moo')
const inspect = require('util').inspect;
const ins = (x) => console.log(inspect(x, {depth: null}));
debugger;

let lexer = moo.compile({
    ws: { match: /\s+/, lineBreaks: true },
    number: /0|[1-9][0-9]*/,
    IDEN: {match: /[a-zA-Z]+/, type: moo.keywords({
        KW: ['while', 'moo'],
      })},
    ANY: { match: /./, type: moo.keywords({ paren: ['(', ')'] }) }
});

lexer.reset(
//123456789AB
 'while (10) cow\nmoo'
)

console.log(lexer.next()) // -> { type: 'KW', value: 'while' }
console.log(lexer.next()) // -> { type: 'ws', value: ' ' }
console.log(lexer.next()) // -> { type: 'paren', value: '(' }
console.log(lexer.next()) // -> { type: 'number', value: '10' }
console.log(lexer.next()) // -> { type: 'paren', value: ')' }
console.log(lexer.next()) // -> { type: 'ws', value: ' ' }
console.log(lexer.next()) // -> { type: 'IDEN', value: 'cow'}
console.log(lexer.next()) // -> { type: 'ws', value: '\n' }
console.log(lexer.next()) // -> { type: 'KW', value: 'moo' }
console.log(lexer.next()) // -> undefined (end of input)
