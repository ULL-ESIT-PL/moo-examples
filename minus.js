const { makeLexer } = require("moo-ignore");
const TokenDef = {
    WS: {match: /\s+/, lineBreaks: true},
    comment: /\/\*.*\*\//,
    number: /[-+]?\d+(?:\.\d*)?(?:[eE][-+]?\d+)?/,
    minus: '-', 
    lparen: '(',
    rparen: ')',
};

lexer = makeLexer(TokenDef, ["WS", "comment"]);
lexer.reset('3-2');
let tokens = [...lexer];
console.log(tokens.length);
