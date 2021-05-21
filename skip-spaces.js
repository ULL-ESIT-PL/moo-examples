/* 
See issue:
https://github.com/no-context/moo/issues/156
*/

const moo = require('moo')
const lex = moo.compile({
  // If one rule is /u then all must be
  ws: { match: /\p{White_Space}+/u, lineBreaks: true },
  /*
     ID_Start characters are derived from the Unicode General_Category of uppercase letters, 
     lowercase letters, titlecase letters, modifier letters, other letters, letter numbers, 
     plus Other_ID_Start, minus Pattern_Syntax and Pattern_White_Space code points.
     In set notation:
         [\p{L}\p{Nl}\p{Other_ID_Start}-\p{Pattern_Syntax}-\p{Pattern_White_Space}]

     ID_Continue characters include ID_Start characters, plus characters having the 
     Unicode General_Category of nonspacing marks, spacing combining marks, 
     decimal number, connector punctuation, plus Other_ID_Continue , 
     minus Pattern_Syntax and Pattern_White_Space code points.

     In set notation:

         [\p{ID_Start}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\p{Other_ID_Continue}-\p{Pattern_Syntax}-\p{Pattern_White_Space}]
  
     See https://unicode.org/reports/tr31/
  */
  word: /\p{XID_Start}\p{XID_Continue}*/u,
  /*
  moo.fallback matches anything else. 
  I believe is the same as: { match: /(?:.|\n)/u, lineBreaks: true}  
  */
  op: moo.fallback,
});

console.log(moo.fallback);

const result = [...lex.reset('while ( a < 3 ) { a += 1; } --;--')];
//console.log(result);
/*
[
  {
    type: 'word',
    value: 'while',
    text: 'while',
    toString: [Function: tokenToString],
    offset: 0,
    lineBreaks: 0,
    line: 1,
    col: 1
  },
  {
    type: 'ws',
    value: ' ',
    text: ' ',
    toString: [Function: tokenToString],
    offset: 5,
    lineBreaks: 0,
    line: 1,
    col: 6
  },
  ... etc.
]
*/

let filtered = result.filter(t => t.type !== 'ws');

console.log(filtered.map(function (t) { return { type: t.type, value: t.value } }) );

/*
]
[
  { type: 'word', value: 'while' },
  { type: 'op', value: '(' },
  { type: 'word', value: 'a' },
  { type: 'op', value: '<' },
  { type: 'op', value: '3' },
  { type: 'op', value: ')' },
  { type: 'op', value: '{' },
  { type: 'word', value: 'a' },
  { type: 'op', value: '+=' },
  { type: 'op', value: '1;' },
  { type: 'op', value: '}' }
]
*/