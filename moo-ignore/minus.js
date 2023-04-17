const { makeLexer } = require("moo-ignore");
const TokenDef = {
    WS: {match: /\s+/, lineBreaks: true},
    comment: { match: /\/\*(?:.|\n)*?\*\//, lineBreaks: true },
    number: /\d+(?:\.\d*)?(?:[eE][-+]?\d+)?/,
    minus: '-', 
};

lexer = makeLexer(TokenDef, ["WS", "comment"]);
//lexer.reset('3-2');
lexer.reset('3 - /* a multiline\ncomment */ 2')
let tokens = [...lexer];
console.log(tokens.map(t => t.type));
