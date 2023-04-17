![](cow.png)

# Moo

[Moo](https://www.npmjs.com/package/moo ) is a highly-optimised tokenizer/lexer generator. Use it to tokenize your strings, before parsing 'em with a parser like [nearley](https://github.com/hardmath123/nearley) or whatever else you're into.


Usage
-----

First, you need to do the needful: `$ npm install moo`.

```js
    const moo = require('moo')

    let lexer = moo.compile({
      WS:      /[ \t]+/,
      comment: /\/\/.*?$/,
      number:  /0|[1-9][0-9]*/,
      string:  /"(?:\\["\\]|[^\n"\\])*"/,
      lparen:  '(',
      rparen:  ')',
      keyword: ['while', 'if', 'else', 'moo', 'cows'],
      NL:      { match: /\n/, lineBreaks: true },
    })
```

And now throw some text at it:

```js
    lexer.reset('while (10) cows\nmoo')
    lexer.next() // -> { type: 'keyword', value: 'while' }
    lexer.next() // -> { type: 'WS', value: ' ' }
    lexer.next() // -> { type: 'lparen', value: '(' }
    lexer.next() // -> { type: 'number', value: '10' }
    // ...
```

When you reach the end of Moo's internal buffer, next() will return `undefined`. You can always `reset()` it and feed it more data when that happens.

Line Numbers
------------

Moo tracks detailed information about the input for you.

It will track line numbers, as long as you **apply the `lineBreaks: true` option to any rules which might contain newlines**. Moo will try to warn you if you forget to do this.

Note that this is `false` by default, for performance reasons: counting the number of lines in a matched token has a small cost. For optimal performance, only match newlines inside a dedicated token:

```js
    newline: {match: '\n', lineBreaks: true},
```


## Token Info 

Token objects (returned from `next()`) have the following attributes:

* **`type`**: the name of the group, as passed to compile.
* **`text`**: the string that was matched.
* **`value`**: the string that was matched, transformed by your `value` function (if any).
* **`offset`**: the number of bytes from the start of the buffer where the match starts.
* **`lineBreaks`**: the number of line breaks found in the match. (Always zero if this rule has `lineBreaks: false`.)
* **`line`**: the line number of the beginning of the match, starting from 1.
* **`col`**: the column where the match begins, starting from 1.


## Value vs. Text 

The `value` is the same as the `text`, unless you provide a [value transform](#transform).

```js
const moo = require('moo')

const lexer = moo.compile({
  ws: /[ \t]+/,
  string: {match: /"(?:\\["\\]|[^\n"\\])*"/, value: s => s.slice(1, -1)},
})

lexer.reset('"test"')
lexer.next() /* { value: 'test', text: '"test"', ... } */
```


## Reset

Calling `reset()` on your lexer will empty its internal buffer, and set the line, column, and offset counts back to their initial value.

If you don't want this, you can `save()` the state, and later pass it as the second argument to `reset()` to explicitly control the internal state of the lexer.

```js
    lexer.reset('some line\n')
    let info = lexer.save() // -> { line: 10 }
    lexer.next() // -> { line: 10 }
    lexer.next() // -> { line: 11 }
    // ...
    lexer.reset('a different line\n', info)
    lexer.next() // -> { line: 10 }
```


## Keywords

Moo makes it convenient to define literals.

```js
    moo.compile({
      lparen:  '(',
      rparen:  ')',
      keyword: ['while', 'if', 'else', 'moo', 'cows'],
    })
```

It'll automatically compile them into regular expressions, escaping them where necessary. 

**See [hello.js](hello.js) for a complete example**

## moo.keywords as a way to manage wide regexps

```js
let lexer = moo.compile({
    ws: { match: /\s+/, lineBreaks: true },
    number: /0|[1-9][0-9]*/,
    IDEN: {match: /[a-zA-Z]+/, type: moo.keywords({
        KW: ['while', 'moo'],
      })},
    ANY: { match: /./, type: moo.keywords({ paren: ['(', ')'] }) }
});
```

For the first example, the `moo.keywords` helper checks matches against the list of keywords; if any of them match, it uses the type `'keyword'` instead of `'identifier'`.

For the second example, the `moo.keywords` helper checks matches against the list `['(', ')']`; if any of them match, it uses the type `'paren'` instead of `'ANY'`.

See example [keywords.js](keywords.js) for a complete example.

## Keyword Types 

Keywords can also have **individual types**.

```js
    let lexer = moo.compile({
      name: {match: /[a-zA-Z]+/, type: moo.keywords({
        'class': 'class',
        'def': 'def',
        'if': 'if',
      })},
      // ...
    })
    lexer.reset('def foo')
    lexer.next() // -> { type: 'def', value: 'def' }
    lexer.next() // space
    lexer.next() // -> { type: 'name', value: 'foo' }
```

## Error management

If none of your rules match, Moo will throw an Error; since it doesn't know what else to do.

If you prefer, you can use **moo.error** to make moo return an **error token** instead of throwing an exception. The `value` of the error token will contain the whole of the rest of the buffer.

```js
    moo.compile({
      // ...
      myError: moo.error,
    })

    moo.reset('invalid')
    moo.next() // -> { type: 'myError', value: 'invalid', text: 'invalid', offset: 0, lineBreaks: 0, line: 1, col: 1 }
    moo.next() // -> undefined
```

You can have a token type that both matches tokens _and_ contains error values.

```js
    moo.compile({
      // ...
      myError: {match: /[\$?`]/, error: true},
    })
```

## Formatting errors 

If you want to throw an error from your parser, you might find `formatError` helpful. Call it with the offending token:

```js
throw new Error(lexer.formatError(token, "invalid syntax"))
```

It returns a string with a pretty error message.

```
Error: invalid syntax at line 2 col 15:

  totally valid `syntax`
                ^
```


## Iteration

Iterators: we got 'em.

```js
    for (let here of lexer) {
      // here = { type: 'number', value: '123', ... }
    }
```

Create an array of tokens.

```js
    let tokens = Array.from(lexer);
```

Use [itt](https://www.npmjs.com/package/itt)'s iteration tools with Moo.

```js
    for (let [here, next] of itt(lexer).lookahead()) { // pass a number if you need more tokens
      // enjoy!
    }
```


## value Transform

**Moo doesn't allow capturing groups**, 
but you can supply a transform function, `value()`, which will be called on the value before storing it in the Token object.

```js
    moo.compile({
      STRING: [
        {match: /"""[^]*?"""/, lineBreaks: true, value: x => x.slice(3, -3)},
        {match: /"(?:\\["\\rn]|[^"\\])*?"/, lineBreaks: true, value: x => x.slice(1, -1)},
        {match: /'(?:\\['\\rn]|[^'\\])*?'/, lineBreaks: true, value: x => x.slice(1, -1)},
      ],
      // ...
    })
```

## Skipping tokens

See examples

* [skip-spaces.js](skip-spaces.js)
* [moo-ignore/minus.js](moo-ignore/minus.js)


## Advanced: States

Similar to Lex and Flex, Moo allows you to define multiple lexer **states**. Each state defines its own separate set of token rules. Your lexer will start off in the first state given to `moo.states({})`.

Rules can be annotated with `next`, `push`, and `pop`, to change the current state after that token is matched. A "stack" of past states is kept, which is used by `push` and `pop`.

* **`next: 'bar'`** moves to the state named `bar`. (The stack is not changed.)
* **`push: 'bar'`** moves to the state named `bar`, and pushes the old state onto the stack.
* **`pop: 1`** removes one state from the top of the stack, and moves to that state. (Only `1` is supported.)

Only rules from the current state can be matched. You need to copy your rule into all the states you want it to be matched in.

For example, to tokenize JS-style string interpolation such as `a${{c: d}}e`, you might use:

```js
    let lexer = moo.states({
      main: {
        strstart: {match: '`', push: 'lit'},
        ident:    /\w+/,
        lbrace:   {match: '{', push: 'main'},
        rbrace:   {match: '}', pop: 1},
        colon:    ':',
        space:    {match: /\s+/, lineBreaks: true},
      },
      lit: {
        interp:   {match: '${', push: 'main'},
        escape:   /\\./,
        strend:   {match: '`', pop: 1},
        const:    {match: /(?:[^$`]|\$(?!\{))+/, lineBreaks: true},
      },
    })
    // <= `a${{c: d}}e`
    // => strstart const interp lbrace ident colon space ident rbrace rbrace const strend
```

The `rbrace` rule is annotated with `pop`, so it moves from the `main` state into either `lit` or `main`, depending on the stack.
