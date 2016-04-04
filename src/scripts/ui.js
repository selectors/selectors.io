var SelectorInput = React.createClass({
  getInitialState: function() {
    return {
      msRemaining: 0,
      lastValue: ""
    }
  },
  
  tick: function() {
    this.setState({
      msRemaining: ((this.state.msRemaining * 10) - 1) / 10
    });
    
    if (this.state.msRemaining <= 0) {
      clearInterval(this.interval);
      
      this.setState({
        msRemaining: 0
      });
    }
  },
  
  handleChange: function() {
    this.update(this.refs.input.value);
  },
  
  clear: function() {
    this.setState({
      lastValue: this.refs.input.value
    });
    
    this.props.onUserInput("");
    ReactDOM.findDOMNode(this.refs.input).focus(); 
  },
  
  redo: function() {
    this.update(this.state.lastValue);
  },
  
  update: function(value) {
    clearInterval(this.interval);
      
    this.setState({
      msRemaining: 1.0,
      lastValue: this.refs.input.value
    });
    
    this.interval = setInterval(this.tick, 100);
    
    this.props.onUserInput(value);
  },
  
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  
  render: function() {
    var
      cooldownClass = this.state.msRemaining > 0.1 ? 'active cooldown' : 'cooldown',
      cooldownText = this.state.msRemaining === 1 ? "1.0" : this.state.msRemaining
    ;
    
    return (
      <div className="row">
        <div className="col-lg-11 col-sm-10 col-xs-9">
          <form>
            <textarea
              autoFocus
              className="form-control"
              placeholder="Type or paste in your CSS selector here..."
              value={this.props.input}
              ref="input"
              onChange={this.handleChange}
            />
            <span className={cooldownClass}>{cooldownText}s until content updates</span>
          </form>
        </div>
        <div className="col-lg-1 col-sm-2 col-xs-3">
          <button className="btn btn-warning form-control" title="Undo Input" disabled={!this.props.input || this.state.msRemaining > 0} onClick={this.clear}>
            <i className="fa fa-undo"></i>
          </button>
          <button className="btn btn-primary form-control" title="Redo Removed Input" disabled={!!this.props.input || !this.state.lastValue || this.state.msRemaining > 0} onClick={this.redo}>
            <i className="fa fa-repeat"></i>
          </button>
        </div>
      </div>
    );
  }
});

var SelectorSequences = React.createClass({
  getInitialState: function() {
    return {
      activeIndex: 0
    }
  },
  
  handleClick: function(e, clickedIndex) {    
    this.setState({
      activeIndex: clickedIndex
    });
    
    this.props.onSequenceClick(
      clickedIndex
    );
  },
  
  render: function() {
    var selectorSequences = this.props.sequences;
      
    if (!selectorSequences || !selectorSequences.length)
      return null
      
    var
      count = selectorSequences.length,
      sequences = new Array(count),
      sequencesPlural = "Sequence" + (count !== 1 ? "s" : "")
      self = this
    ;
      
    selectorSequences.forEach(function (sequence, index) {
      var className = self.state.activeIndex === index ? "active" : "";
      
      sequences[index] = (
        <li
          className={className}
          key={index}
          onClick={self.handleClick.bind(null, this, index)}
        >
          {sequence}
        </li>
      )
    });
      
    return (
      <span>
        <dl>
          <dt>{count} Selector {sequencesPlural} found...</dt>
          <dd className="text-muted">Click on a tab below to view deconstructed information.</dd>
        </dl>
        <ul>
          {sequences}
        </ul>
      </span>
    )
  }
});

var FormattedSelectorValidation = React.createClass({
  componentDidMount: function() {    
    var domNode = ReactDOM.findDOMNode(this)
    
    if (!domNode)
      return;
      
    this.props.onValidInput(domNode.className === "is-valid");
  },
  
  render: function() {    
    var 
      invalid = [],
      invalidHTML = [],
      invalidCSSPseudo = [],
      elements = this.props.elements,
      elementCount = elements.length,
      pseudoElements = [],
      pseudoNotAtEnd = [],
      hasDeprecatedSingleColonPseudoElement,
      self = this
    ;
    
    elements.forEach(function(selectors, index) {
      var 
        currentElement = index + 1,
        types = [],
        ids = [],
        negation = [],
        invalidHTMLType = null,
        invalidHTMLAttributes = [],
        invalidCSSPseudoClasses = [],
        invalidCSSPseudoValues = [],
        invalidCSSPseudoElement = null
      ;
      
      selectors.forEach(function(selector, subIndex) {
        if (selector.isValid === false) {
          if (selector.type === "type")
            invalidHTMLType = selector;
          else if (selector.type === "attribute")
            invalidHTMLAttributes.push(selector);
          else if (selector.type === "pseudo-class") {
            switch (selector.properties.name) {
              case "nth-child":
              case "nth-last-child":
              case "nth-of-type":
              case "nth-last-of-type":
              case "lang":
                invalidCSSPseudoValues.push(selector);
                break;
              default:
                invalidCSSPseudoClasses.push(selector);
            }
          }
          else if (selector.type === "pseudo-element")
            invalidCSSPseudoElement = selector;
          else if (selector.type === "negation")
            negation.push(selector);
        }
             
        if (selector.type === "type" || selector.type === "universal")
          types.push(selector);
        else if (selector.type === "id" && ids.indexOf(selector.selector) === -1)
          ids.push(selector.selector);
        else if (selector.type === "pseudo-element") {
          pseudoElements.push(selector.selector);
          
          if (subIndex !== selectors.length - 1 || index != elementCount - 1)
            pseudoNotAtEnd.push(selector.selector);
          
          if (selector.properties.colons === 1 && !hasDeprecatedSingleColonPseudoElement)
            hasDeprecatedSingleColonPseudoElement = selector.properties.name;
        }
      });
      
      if (invalidCSSPseudoClasses.length) {
        var  
          pc1 = invalidCSSPseudoClasses[0],
          footnote = (
            <small key={index} className="text-muted"><sup>&#8224;</sup> Custom pseudo-classes must be prefixed with either <code>&ldquo;-name-&rdquo;</code> or <code>&ldquo;_name-&rdquo;</code> (like <code className="selector pseudo-class">:-custom-{pc1.properties.name}</code>).</small>
          )
        ;
        
        if (invalidCSSPseudoClasses.length > 1) {
          var
            pc2 = invalidCSSPseudoClasses[1],
            more = invalidCSSPseudoClasses.length > 2 ? invalidCSSPseudoClasses.length - 2 : false
          ;
        
          if (!more)
            invalidCSSPseudo.push(
              <li key={index}>
                Multiple unknown pseudo-classes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes unknown <code className="selector pseudo-class">:{pc1.properties.name}</code> and <code className="selector pseudo-class">{pc2.properties.name}</code> pseudo-classes.</em>
                <br/>
                {footnote}
              </li>
            );
          
          else
            invalidCSSPseudo.push(
              <li key={index}>
                Multiple unknown pseudo-classes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes unknown <code className="selector pseudo-class">:{pc1.properties.name}</code>, <code className="selector pseudo-class">{pc2.properties.name}</code> and {more} other pseudo-classes.</em>
                <br/>
                {footnote}
              </li>
            );
        }
        else {
          invalidCSSPseudo.push(
            <li key={index}>
              Unknown pseudo-class detected.<sup>&#8224;</sup>
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes unknown <code className="selector pseudo-class">:{pc1.properties.name}</code> pseudo-class.</em>
              <br/>
              {footnote}
            </li>
          )
        }
      }
      
      if (invalidCSSPseudoValues.length) {
        var  
          pv1 = invalidCSSPseudoValues[0]
        ;
        
        if (invalidCSSPseudoValues.length > 1) {
          var
            pv2 = invalidCSSPseudoValues[1],
            more = invalidCSSPseudoValues.length > 2 ? invalidCSSPseudoValues.length - 2 : false
          ;
        
          if (!more)
            invalidCSSPseudo.push(
              <li key={index}>
                Multiple invalid pseudo-class values detected.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code> and <code className="selector pseudo-class">:{pv2.properties.name}</code> whose values (<code>&ldquo;{pv1.properties.args}&rdquo;</code> and <code>&ldquo;{pv2.properties.args}&rdquo;</code>) aren't valid.</em>
              </li>
            );
          
          else
            invalidCSSPseudo.push(
              <li key={index}>
                Multiple invalid pseudo-class values detected.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code>, <code className="selector pseudo-class">:{pv2.properties.name}</code> and {more} other(s) (like <code>&ldquo;{pv1.properties.args}&rdquo;</code> and <code>&ldquo;{pv2.properties.args}&rdquo;</code>) aren't valid.</em>
              </li>
            );
        }
        else {
          invalidCSSPseudo.push(
            <li key={index}>
              Unknown pseudo-class value detected.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code> whose value (<code>&ldquo;{pv1.properties.args}&rdquo;</code>) isn't valid.</em>
            </li>
          )
        }
      }
      
      if (invalidCSSPseudoElement) {
        invalidCSSPseudo.push(
          <li key={index}>
             Unknown pseudo-element detected.<sup>&#8224;</sup>
            <br/>
            <em className="text-info">Element {currentElement}'s selector includes unknown pseudo-element <code className="selector pseudo-element">::{invalidCSSPseudoElement.properties.name}</code>.</em>
            <br/>
            <small className="text-muted"><sup>&#8224;</sup> Custom pseudo-elements must be prefixed with either <code>&ldquo;-name-&rdquo;</code> or <code>&ldquo;_name-&rdquo;</code> (like <code className="selector pseudo-element">::-custom-{invalidCSSPseudoElement.properties.name}</code>).</small>
          </li>
        )
      }
      
      if (invalidHTMLType) {
        invalidHTML.push(
          <li key={index}>
             Unknown type detected.
            <br/>
            <em className="text-info">Element {currentElement}'s selector includes unknown type <code className="selector type">{invalidHTMLType.selector}</code>.</em>
          </li>
        )
      }
      
      if (invalidHTMLAttributes.length) {
        var  
          a1 = invalidHTMLAttributes[0]
        ;
        
        if (invalidHTMLAttributes.length > 1) {
          var
            a2 = invalidHTMLAttributes[1],
            more = invalidHTMLAttributes.length > 2 ? invalidHTMLAttributes.length - 2 : false
          ;
        
          if (!more)
            invalidHTML.push(
              <li key={index}>
                Multiple unknown attributes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes both <code className="selector attrbute">{a1.properties.name}</code> and <code className="selector attribute">{a2.properties.name}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> If this is a custom attribute, you should prefix it with <code>&ldquo;data-&rdquo;</code> (like <code className="selector attribute">data-{a1.properties.name}</code>).</small>
              </li>
            );
          
          else
            invalidHTML.push(
              <li key={index}>
                Multiple unknown attributes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector attrbute">{a1.properties.name}</code>, <code className="selector attribute">{a2.properties.name}</code> and {more} other(s).</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> If this is a custom attribute, you should prefix it with <code>&ldquo;data-&rdquo;</code> (like <code className="selector attribute">data-{a1.properties.name}</code>).</small>
              </li>
            );
        }
        else {
          invalidHTML.push(
            <li key={index}>
              Unknown attribute detected.<sup>&#8224;</sup>
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector attribute">{a1.properties.name}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> If this is a custom attribute, you should prefix it with <code>&ldquo;data-&rdquo;</code> (like <code className="selector attribute">data-{a1.properties.name}</code>).</small>
            </li>
          )
        }
      }
      
      if (types.length > 1) {
        var
          t1 = types[0].selector,
          t1Class = "selector " + types[0].type,
          t2 = types[1].selector,
          t2Class = "selector " + types[1].type,
          more = types.length > 2 ? types.length - 2 : false
        ;
          
        if (!more)
          invalid.push(
            <li key={index}>
              Selectors should only ever include <strong>one</strong> type <em>or</em> universal selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes both <code className={t1Class}>{t1}</code> and <code className={t2Class}>{t2}</code>.</em>
            </li>
          );
          
        else
          invalid.push(
            <li key={index}>
              Selectors should only ever include <strong>one</strong> type <em>or</em> universal selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className={t1Class}>{t1}</code>, <code className={t2Class}>{t2}</code> and {more} other(s).</em>
            </li>
          );
      }
      
      if (ids.length > 1) {
        var 
          id1 = ids[0],
          id2 = ids[1],
          more = ids.length > 2 ? ids.length - 2 : false
        ;
        
        if (!more)
          invalid.push(
            <li key={index}>
              Selectors should only ever include <strong>one</strong> unique<sup>&#8224;</sup> ID selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes both <code className="selector id">{id1}</code> and <code className="selector id">{id2}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> Note that repeating the same ID multiple times <em>is</em> valid.</small>
            </li>
          );
        
        else
          invalid.push(
            <li key={index}>
              Selectors should only ever include <strong>one</strong> unique<sup>&#8224;</sup> ID selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector id">{id1}</code>, <code className="selector id">{id2}</code> and {more} other(s).</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> Note that repeating the same ID multiple times <em>is</em> valid.</small>
            </li>
          );
      }
      
      if (negation.length) {
        var  
          n1 = negation[0]
        ;
        
        if (negation.length > 1) {
          var
            n1 = negation[1],
            more = negation.length > 2 ? negation.length - 2 : false
          ;
        
          if (!more)
            invalid.push(
              <li key={index}>
                Negation selectors must not contain other negation selectors or pseudo-element selectors.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes both <code className="selector negation">{n1.selector}</code> and <code className="selector negation">{n2.selector}</code>.</em>
              </li>
            );
          
          else
            invalid.push(
              <li key={index}>
                Negation selectors must not contain other negation selectors or pseudo-element selectors.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector negation">{n1.selector}</code> and <code className="selector negation">{n2.selector}</code> and {more} other(s).</em>
              </li>
            );
        }
        else {
          invalid.push(
            <li key={index}>
              Negation selectors must not contain other negation selectors or pseudo-element selectors.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector negation">{n1.selector}</code>.</em>
            </li>
          )
        }
      }
    });
    
    if (pseudoElements.length > 1) {
      var 
        pe1 = pseudoElements[0],
        pe2 = pseudoElements[1],
        more = pseudoElements.length > 2 ? pseudoElements.length - 2 : false
      ;
      
      if (!more)
        invalid.push(
          <li>
            Selectors should only ever include <strong>one</strong> pseudo-element selector.
            <br/>
            <em className="text-info">The selector sequence includes both <code className="selector pseudo-element">{pe1}</code> and <code className="selector pseudo-element">{pe2}</code>.</em>
          </li>
        );
      
      else
        invalid.push(
          <li>
            Selector sequences should only ever include <strong>one</strong> pseudo-element selector.
            <br/>
            <em className="text-info">The selector sequence includes <code className="selector pseudo-element">{pe1}</code>, <code className="selector pseudo-element">{pe2}</code> and {more} other(s).</em>
          </li>
        );
    }
    
    if (pseudoNotAtEnd.length && pseudoElements.length === 1) {
      var pe = pseudoNotAtEnd[pseudoNotAtEnd.length - 1];
      
      invalid.push(
        <li>
          Pseudo-elements must be placed at the very end of a selector sequence.
          <br/>
          <em className="text-info"><code className="selector pseudo-element">{pe}</code> is not the final selector attached to Element {elementCount}.</em>
        </li>
      )
    }
      
    if (invalid.length) {
      var errorCountText = "error" + (invalid.length > 1 ? "s" : "");
    
      return (
        <div className="alert alert-danger">
          <p><i className="fa fa-warning"></i> This selector sequence is not valid <span className="alert-count">(<strong>{invalid.length} {errorCountText}</strong>):</span></p>
          <div className="alert alert-warning">
            <ol className="text-danger">{invalid}</ol>
          </div>
        </div>
      );
    }
    
    var
      successAlert,
      deprecatedPseudoElementAlert,
      invalidCSSPseudoAlert,
      invalidHTMLAlert,
      warningCountText
    ;
    
    if (!invalidCSSPseudo.length)
      successAlert = (
        <div className="alert alert-success">
          <p><i className="fa fa-check"></i> This selector sequence is valid and will select <strong>Element {elementCount}</strong>.</p>
        </div>
      );
    
    if (invalidCSSPseudo.length) {
      warningCountText = "warning" + (invalidCSSPseudo.length > 1 ? "s" : "");
      
      invalidCSSPseudoAlert = (
        <div className="alert alert-warning">
          <p><i className="fa fa-warning"></i> This doesn't conform to the <a href="https://www.w3.org/TR/selectors/">Selectors Level 3</a> recommendation.<sup>&#8224;</sup>. <span className="alert-count">(<strong>{invalidCSSPseudo.length} {warningCountText}</strong>):</span></p>
          <div className="alert">
            <ol className="text-warning">{invalidCSSPseudo}</ol>
          </div>
          <p className="text-muted"><sup>&#8224;</sup> <span className="text-danger">Not all CSS implementations adhere to this, which is why this is only a warning and not an error. If you're creating a native website which doesn't implement any fancy, non-conforming pseudo-classes and pseudo-elements then this should be treated as an error.</span></p>
          <hr/>
          <p>This selector sequence will select <strong>Element {elementCount}</strong>.</p>
        </div>
      );
    }
    
    if (invalidHTML.length) {
      warningCountText = "warning" + (invalidHTML.length > 1 ? "s" : "");
      
      invalidHTMLAlert = (
        <div className="alert alert-warning">
          <p><i className="fa fa-warning"></i> This doesn't conform to the <a href="https://www.w3.org/TR/html5/">HTML5</a>, <a href="https://www.w3.org/TR/SVG11/">SVG1.1</a> or <a href="https://www.w3.org/TR/MathML3/">MathML3</a> recommendations.<sup>&#8224;</sup> <span className="alert-count">(<strong>{invalidHTML.length} {warningCountText}</strong>):</span></p>
          <div className="alert">
            <ol className="text-warning">{invalidHTML}</ol>
          </div>
          <p className="text-muted"><sup>&#8224;</sup> If you're not using this with HTML, SVG or MathML, you can ignore this warning box.</p>
        </div>
      );
    }
      
    if (hasDeprecatedSingleColonPseudoElement)
      deprecatedPseudoElementAlert = (
        <div className="alert alert-info">
          <p><i className="fa fa-info-circle"></i> This selector sequence contains the deprecated single-colon pseudo-element syntax. The CSS Selectors Level 3 specification mandates that pseudo-elements are prefixed with two colon characters (<code className="selector pseudo-element">::{hasDeprecatedSingleColonPseudoElement}</code> instead of <code className="selector pseudo-element">:{hasDeprecatedSingleColonPseudoElement}</code>).</p>
        </div>
      );
           
    return (
      <div className="is-valid">
        {successAlert}
        {invalidCSSPseudoAlert}
        {invalidHTMLAlert}
        {deprecatedPseudoElementAlert}
      </div>
    );
  }
});

var FormattedElement = React.createClass({
  render: function() {
    var selectors = this.props.selectors;
      
    var
      formatted = new Array(selectors.length),
      marginLeft = { marginLeft: this.props.margin + "px" }
    ;
    
    selectors.forEach(function(s, index) {
      var
        className = "selector " + s.type + (s.type === "combinator" && s.selector === " " ? " space" : ""),
        selector = s.selector
      ;
      
      formatted[index] = (
        <span className={className} key={index}>
          {selector}
        </span>
      )
    });
    
    return (
      <div className="formatted-element" style={marginLeft}>
        {formatted}
      </div>
    )
  }
});

var FormattedSelectorSequence = React.createClass({
  handleValidInput: function(valid) {
    this.props.onValidInput(valid);
  },
  
  render: function() {
    var selectors = this.props.selectors;
    
    if (selectors && selectors.invalidSequenceArray) {
      var invalidSequence = new Array(selectors.invalidSequenceArray.length);
      
      selectors.invalidSequenceArray.forEach(function(selectorObj, index) {
        if (selectorObj.text) {
          if (selectorObj.valid)
            invalidSequence.push(
              <span key={index} className="text-muted">{selectorObj.text}</span>
            );
          else 
            invalidSequence.push(
              <span key={index} className="invalid-selector-part">{selectorObj.text}</span>
            );
        }
      });
      
      return (
        <div id="formatted-selector-area">
          <div className="alert alert-danger">
            <i className="fa fa-exclamation-circle"></i> The passed-in selector is invalid.
          </div>
          <p>Invalid parts are highlighted below:</p>
          <pre>{invalidSequence}</pre>
          <div className="alert alert-warning">
            <i className="fa fa-warning"></i> In-depth information as to <em>why</em> this selector sequence is invalid is outside of the scope of selectors.io until a later release. If you believe this selector <em>is</em> valid and that this error has been generated incorrectly, please raise an issue on the GitHub repository at <i className="fa fa-bug"></i> <a href="https://github.com/selectors/selectors.io/issues">github.com/selectors/selectors.io/issues</a>, remembering to include the exact selector you used to generate this message so that it can be replicated.
          </div>
        </div>
      );
    }
    else if (!selectors || !selectors.elements || !selectors.elements.detailed || !selectors.elements.detailed.length)
      return (<div id="formatted-selector-area"></div>);
    
    var
      onValidInput = this.props.onValidInput,
      elements = selectors.elements.detailed,
      formatted = new Array(elements.length),
      margin = 0,
      marginIncrement = 6,
      elementCount = elements.length
    ;
    
    elements.forEach(function(selectors, index) {
      var first = elements[index][0];
      
      if (first.type === "combinator" && (first.selector === " " || first.selector === ">"))
        margin += marginIncrement;
      
      formatted[index] = (
        <FormattedElement margin={margin} selectors={selectors} index={index} total={elementCount} key={index} />
      );
    });
    
    return (
      <div id="formatted-selector-area">
        <pre>{formatted}</pre>
        <FormattedSelectorValidation elements={elements} onValidInput={this.handleValidInput} />
      </div>
    )
  }
});

var SelectorSequenceSummary = React.createClass({
  render: function() {
    var selectors = this.props.selectors;
    
    if (!selectors || !selectors.elements || !selectors.elements.detailed || !selectors.elements.detailed.length)
      return (<p className="text-muted">Unable to generate a summary.</p>);
    
    var
      elements = elements = selectors.elements.detailed,
      summary = [],
      nextSuffix = undefined,
      elementRelation,
      parentTextIndex = 0,
      parentText = ["", "Parent", "Grandparent", "Ancestor"]
    ;
    
    elements.reverse().forEach(function(selectors, index) {
      var
        elementSummary = [],
        elementRef = elements.length - index,
        lastSelector = selectors[selectors.length - 1],
        combinator = null,
        type = null,
        id = null,
        classes = [],
        attributes = [],
        pseudoClasses = [],
        negation = [],
        pseudoElement = lastSelector.type === "pseudo-element" ? lastSelector : false,
        r = {}
      ;
      
      selectors.forEach(function(selector, subindex) {
        if (!(pseudoElement && subindex === selectors.length - 1)) {
          var simpleSelector = selector.selector.trim();
          
          switch (selector.type) {
            case "combinator":
              combinator = simpleSelector ? simpleSelector : " ";
              break;
            case "type":
            case "universal":
              type = selector;
              break;
            case "id":
              id = simpleSelector;
              break;
            case "class":
              classes.push(simpleSelector);
              break;
            case "attribute":
              attributes.push(selector);
              break;
            case "pseudo-class":
              pseudoClasses.push(selector);
              break;
            case "negation":
              negation.push(selector);
              break;
            default:
              console.warn("UNKNOWN TYPE", selector.type, selector);
              break;
          }
        }
      });
      
      if (pseudoElement) {
        r.prefix = <span>This applies the <code className="selector pseudo-element">{pseudoElement.selector}</code> pseudo-element to</span>;
        elementRelation = <span><i className="fa fa-check"></i> Selected</span>;
      }
      else if (elements.length - index === elements.length) {
        r.prefix = <span>This selects</span>;
        elementRelation = <span><i className="fa fa-check"></i> Selected</span>;
      }
      
      if (type) {
        var
          suffix,
          actualType
        ;
        
        if (type.namespace !== null) {
          actualType = type.selector.replace(type.namespace + "|", "");
          
          switch (type.namespace) {
            case "":
              suffix = <span> which isn't part of any namespace,</span>
              break;
            case "*":
              suffix = <span> which is part of any namespace (<code className="selector type">*</code>),</span>
              break;
            default:
              suffix = <span> which is part of the <code className="selector type">{type.namespace}</code> namespace,</span>
              break;
          }
        }
        else {
          actualType = type.selector
        }
        
        if (actualType !== "*")
          r.type = (
            <span>any <code className="selector type">&lt;{actualType}&gt;</code> element{suffix}</span>
          );
        else if (actualType === "*")
          r.type = <span>any element (<code className="selector universal">*</code>){suffix}</span>
      }
      else
        r.type = <span>any element</span>;
        
      if (id)
        r.id = <span> whose unique <code>id</code> attribute is exactly <code className="selector id">{id}</code></span>
        
      if (classes.length) {
        var classesText = "";
        
        if (id)
          classesText += ", and";
          
        classesText += " whose <code>class</code> attribute contains "
        
        classes.forEach(function(className, index) {
          if (index > 0)
            classesText += (index === classes.length - 1 ? " and " : ", ")
            
          classesText += "<code class='selector class'>" + className + "</code>";
        });
          
        classesText = {__html: classesText};
        r.classes = <span dangerouslySetInnerHTML={classesText}></span>;
      }
      
      if (attributes.length) {
        var attributesText = "";
        
        if (id || classes.length)
          attributesText += ", and";
        
        attributes.forEach(function(attribute, index) {
          if (index > 0)
            attributesText += (index === classes.length - 1 ? " and " : ", ")
            
          var properties = attribute.properties;
          
          if (properties.symbol && properties.value) {
            attributesText += " whose ";
          }
          else {
            attributesText += " which has a "
          }
            
          if (properties.namespace)
              attributesText += "<code>" + properties.namespace + "</code>-namespaced ";
            
          attributesText += "<code class='selector attribute'>" + properties.name + "</code> attribute";
          
          if (properties.symbol && properties.value) {
            attributesText += "'s value "
            
            switch (properties.symbol) {
              case "=":
                attributesText += "is exactly <code>&ldquo;" + properties.value + "&rdquo;</code>";
                break;
              case "~=":
                attributesText += "is a whitespace-separated list of words containing <code>&ldquo;" + properties.value + "&rdquo;</code>";
                break;
              case "|=":
                attributesText += "is exactly <code>&ldquo;" + properties.value + "&rdquo;</code> or is that followed by a hyphen character (<code>&ldquo;" + properties.value + "-&rdquo;</code>)";
                break;
              case "^=":
                attributesText += "begins with <code>&ldquo;" + properties.value + "&#8230;&rdquo;</code>";
                break;
              case "$=":
                attributesText += "ends with <code>&ldquo;" + properties.value + "&#8230;&rdquo;</code>";
                break;
              case "*=":
                attributesText += "contains <code>&ldquo;" + properties.value + "&rdquo;</code>";
                break;
            }
          }
        });
          
        attributesText = {__html: attributesText};
        r.attributes = <span dangerouslySetInnerHTML={attributesText}></span>;
      }
      
      if (pseudoClasses.length) {
        var pseudoClassText = "";
        
        if (id || classes.length || attributes.length)
          pseudoClassText += ", and";
          
        pseudoClassText += " which is subject to the"
          
        pseudoClasses.forEach(function(pseudoClass, index) {
          if (index > 0)
            pseudoClassText += (index === pseudoClasses.length - 1 ? " and" : ",")
            
          pseudoClassText += " <code class='selector pseudo-class'>" + pseudoClass.selector + "</code>";
        });
          
        pseudoClassText += " pseudo-class" + (pseudoClasses.length > 1 ? "es" : "");
          
        pseudoClassText = {__html: pseudoClassText};
        r.pseudoClasses = <span dangerouslySetInnerHTML={pseudoClassText}></span>;
      }
      
      if (negation.length) {
        var negationText = "";
        
        if (id || classes.length || attributes.length || pseudoClasses.length)
          negationText += ", but";
        else
          negationText += " which";
          
        negationText += " is <strong>not</strong> matched by the ";
        
        negation.forEach(function(not, index) {
          if (index > 0)
            negationText += (index === negation.length - 1 ? " or the" : ", the");
            
          negationText += " " + not.properties.type + " selector <code class='selector " + not.properties.type + "'>" + not.properties.selector + "</code>";
        });
          
        negationText = {__html: negationText};
        r.negation = <span dangerouslySetInnerHTML={negationText}></span>;
      }
      
      r.elementRef = <span><small className="text-muted">({elementRelation} Element {elementRef})</small></span>;
      
      summary.push(
        <p key={index}>
          {nextSuffix} {r.prefix} {r.type}{r.id}{r.classes}{r.attributes}{r.pseudoClasses}{r.negation} {r.elementRef}
        </p>
      );
      
      nextSuffix = undefined;
      
      if (combinator) {
        var
          combinatorText
        ;
        
        if ((combinator === " " || combinator === ">") && parentTextIndex !== 3) {
          parentTextIndex++;
        }
        
        var parent = parentText[parentTextIndex];
        
        switch (combinator) {
          case " ":
            combinatorText = "a descendant of";
            elementRelation = parent;
            break;
          case ">":
            combinatorText = "a direct child of";
            elementRelation = parent;
            break;
          case "+":
            combinatorText = "the sibling next to";
            elementRelation = (parent ? parent + " " : "") + "Sibling";
            break;
          case "~":
            combinatorText = "any sibling of";
            elementRelation = (parent ? parent + " " : "") + "Sibling";
            break;
          default:
            console.warn("UNKNOWN COMBINATOR", combinator);
            break;
        }
        
        nextSuffix = (
          <span>&#8230;which is {combinatorText}</span>
        );
      }
    });
      
    return (
      <blockquote>
        {summary}
      </blockquote>
    )
  }
});

var SelectorsIOMain = React.createClass({
  updateTimer: null,
  
  getInitialState: function() {
    return this.setInitialState();
  },
  
  setInitialState: function() {
    return {
      activeIndex: 0,
      input: "",
      inputCooldownActive: false,
      data: null,
      canDeconstruct: false,
      sequences: null,
      selectors: null
    }
  },
  
  handleUserInput: function(input) {
    if (!input) {
      this.setState({
        activeIndex: 0,
        data: null,
        input: '',
        inputCooldownActive: false,
        sequences: null,
        canDeconstruct: false
      });
    }
    else {
      this.setState({
        input: input
      })
      
      if (this.updateTimer) {
        window.clearTimeout(this.updateTimer);
        this.updateTimer = null;
      }
      else {
        this.setState({
          inputCooldownActive: true
        });
      }
      
      var self = this;
      
      this.updateTimer = setTimeout(function() {
        var data = new core.SelectorsIO(input);
        
        self.updateTimer = null;
        
        self.setState({
          activeIndex: 0,
          data: data,
          inputCooldownActive: false,
          sequences: data.selectorSequences,
          canDeconstruct: false
        });
        
        self.handleSequenceClick(0);
      }, 1000);
    }
  },
  
  handleSequenceClick: function(index) {    
    this.state.data.changeActiveSelectorSequence(index);
    
    this.setState({
      selectors: this.state.data.selectors
    });
  },
  
  deconstruct: function(isValid) {
    this.setState({
      canDeconstruct: isValid
    });
  },
  
  setSelectorInput: function(value) {
    this.setState({
      input: value
    })
    
    if (this.updateTimer) {
      window.clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    else {
      this.setState({
        inputCooldownActive: true
      });
    }
    
    var self = this;
    
    this.updateTimer = setTimeout(function() {
      var data = new core.SelectorsIO(value);
       
      self.updateTimer = null;
      
      self.setState({
        activeIndex: 0,
        data: data,
        inputCooldownActive: false,
        sequences: data.selectorSequences,
        canDeconstruct: false
      });
      
      self.handleSequenceClick(0);
    }, 1000);
  },

  render: function() {
    var
      selectorInput,
      mediaQueryNotice,
      selectorSequences,
      formattedSelectorSequence,
      deconstructionPane,
      deconstruction
    ;
    
    if (this.state.data && this.state.input && !this.state.inputCooldownActive) {      
      if (this.state.data.hasMediaQuery)
        mediaQueryNotice = (
          <div className="alert alert-warning">
            <i className="fa fa-warning"></i> The <code>{this.state.data.hasMediaQuery}</code> &lsquo;at keyword&rsquo; has been ignored ignored. <abbr title="'at keywords' are outside of the scope of selectors.io until a later release">Why?</abbr>
          </div>
        );
        
      if (this.state.canDeconstruct && this.state.selectors)
        deconstruction = (
          <article id="deconstruction-summary">
            <h3>Summary</h3>
            <SelectorSequenceSummary selectors={this.state.selectors} />
          </article>
        );
      
      if (this.state.sequences)
        selectorSequences = (
          <nav id="sequence-list">
            <SelectorSequences
              onSequenceClick={this.handleSequenceClick}
              sequences={this.state.sequences}
            />
            {mediaQueryNotice}
          </nav>
        );
      
      if (this.state.selectors)
        formattedSelectorSequence = (
          <section id="deconstructed-area">
            <FormattedSelectorSequence
              selectors={this.state.selectors}
              onValidInput={this.deconstruct}
            />
          </section>
        );
        
      deconstructionPane = (
        <div className="row">
          <div className="col-md-4">
            {selectorSequences}
          </div>
          <div className="col-md-8">
            {formattedSelectorSequence}
            {deconstruction}
          </div>
        </div>
      );
    }
    else if (this.state.inputCooldownActive) {
      deconstructionPane = (
        <div className="alert alert-warning">
          <i className="fa fa-cog fa-spin"></i> Processing...
        </div>
      )
    }
    else {
      var 
        self = this,
        popularExamples = [],
        popularSelectors = [
          {
            description: "Bootstrap",
            selectorSequence: ".list-group-item > .badge + .badge"
          },
          {
            description: "<a href='http://stackoverflow.com/q/3859101/1317805'>This</a> Stack Overflow question",
            selectorSequence: "a[href^=\"http:\"]"
          },
          {
            description: "The Selectors Level 3 W3C Recommendation",
            selectorSequence: "ns|*"
          },
          {
            description: "Normalize.css",
            selectorSequence: "audio:not([controls])"
          }
        ]
      ;
      
      popularSelectors.forEach(function(popular, index) {
        popularExamples.push(
          <p key={index}>
            <strong>
              <a className="selector" onClick={function() { self.setSelectorInput(popular.selectorSequence) }}>
                {popular.selectorSequence}
              </a>
            </strong>
            <small dangerouslySetInnerHTML={ { __html: popular.description }}></small>
          </p>
        );
      });
      
      deconstructionPane = (
        <div className="row" id="splash">
          <div className="col-md-12">
            <article id="start-here">
              <span className="text-success">
                <p className="arrows lead text-center"><i className="fa fa-arrow-up"></i><i className="fa fa-arrow-up"></i><i className="fa fa-arrow-up"></i></p>
                <p className="lead text-center">Start by typing or pasting in any CSS selector you like into the above text input field</p>
              </span>
            </article>
            <hr/>
            <article id="welcome">
              <h2>Welcome</h2>
              <p>
                <strong>Selectors.io</strong> has only recently been launched and is still in a very beta-esque state.
              </p>
              <p>
                It's open-sourced on <i className="fa fa-github"></i> GitHub at <a href="https://github.com/selectors/selectors.io">github.com/selectors/selectors.io</a>.
                <br/>
                If you find any bugs, feel free to report them at <i className="fa fa-bug"></i> <a href="https://github.com/selectors/selectors.io/issues">github.com/selectors/selectors.io/issues</a>.
              </p>
            </article>
            <h4>Examples</h4>
            <p>
              If you're lost for inspiration, you can click on any of the below examples to give Selectors.io a try!
              <br/>
              <span className="text-muted">Note that you can get back to this list at any point by clicking the <i className="fa fa-undo"></i> button.</span>
            </p>
            <blockquote>
              {popularExamples}
            </blockquote>
          </div>
        </div>
      )
    }
    
    return (
      <div>
        <div id="selector-input">
          <SelectorInput
            input={this.state.input}
            onUserInput={this.handleUserInput}
          />
        </div>
        {deconstructionPane}
      </div>
    );
  }
});

ReactDOM.render(
  <SelectorsIOMain />,
  document.getElementById('main-area')
);