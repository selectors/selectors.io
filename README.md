#[Selectors.io](https://selectors.io)
https://selectors.io is an online CSS Selector deconstructor which aims to answer the age-old question of ‘What does this CSS selector do?’

##Examples
Load up https://selectors.io and paste any of the following CSS Selectors into the selector input area at the top to have the site attempt to deconstruct them and tell you exactly what they are selecting:

| Selector | Selectors.io Deconstruction |
| :--- |
| `.list-group-item > .badge + .badge` ([Bootstrap](https://github.com/twbs/bootstrap)) | [https://selectors.io/s=.list-group-item>.badge+.badge](https://selectors.io/?s=.list-group-item%20%3E%20.badge%20%2B%20.badge) |
| `a[href^="http:"]` ([A Stack Overflow question](http://stackoverflow.com/q/3859101/1317805)) | [https://selectors.io/s=a\[href^="http:"\]](https://selectors.io/?s=a%5Bhref%5E%3D%22http%3A%22%5D) |
| <code>ns&#124;*</code> ([Selectors Level 3 W3C Recommendation](https://www.w3.org/TR/css3-selectors/#univnmsp)) | [https://selectors.io/s=ns&#124;\*](https://selectors.io/?s=ns%7C*) |
| `audio:not([controls])` ([Normalize.css](https://github.com/necolas/normalize.css)) | [https://selectors.io/s=audio:not(\[controls\])](https://selectors.io/?s=audio%3Anot\(%5Bcontrols%5D%29) |

##Compiling the Source
This uses Grunt for concatenating and minifying the JavaScript files and generating CSS. This is configured through Node.js, so you'll also need to install that, then run the following command to install the packages:

```JavaScript
npm install
```

After that's set up, simply point to the project's root directory and run:

```JavaScript
grunt
```