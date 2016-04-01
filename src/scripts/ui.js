var SelectorInput = React.createClass({
  getInitialState: function() {
    return {
      msRemaining: 0
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
    clearInterval(this.interval);
      
    this.setState({
      msRemaining: 1.0
    });
    
    this.interval = setInterval(this.tick, 100);
    
    this.props.onUserInput(
      this.refs.input.value
    );
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
      <form>
        <textarea
          autoFocus
          className="form-control"
          placeholder="Enter your CSS selector here..."
          value={this.props.input}
          ref="input"
          onChange={this.handleChange}
        />
        <span className={cooldownClass}>{cooldownText}s until content updates</span>
      </form>
    );
  }
});

var SelectorSequences = React.createClass({
  getInitialState: function() {
    return {
      activeIndex: 0
    }
  },
  
  handleClick: function(clickedIndex) {    
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
          onClick={self.handleClick.bind(this, index)}
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
            <small className="text-muted"><sup>&#8224;</sup> Custom pseudo-classes must be prefixed with either <code>&ldquo;-name-&rdquo;</code> or <code>&ldquo;_name-&rdquo;</code> (like <code className="selector pseudo-class">:-custom-{pc1.properties.name}</code>).</small>
          )
        ;
        
        if (invalidCSSPseudoClasses.length > 1) {
          var
            pc2 = invalidCSSPseudoClasses[1],
            more = invalidCSSPseudoClasses.length > 2 ? invalidCSSPseudoClasses.length - 2 : false
          ;
        
          if (!more)
            invalidCSSPseudo.push(
              <li>
                Multiple unknown pseudo-classes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes unknown <code className="selector pseudo-class">:{pc1.properties.name}</code> and <code className="selector pseudo-class">{pc2.properties.name}</code> pseudo-classes.</em>
                <br/>
                {footnote}
              </li>
            );
          
          else
            invalidCSSPseudo.push(
              <li>
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
            <li>
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
              <li>
                Multiple invalid pseudo-class values detected.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code> and <code className="selector pseudo-class">:{pv2.properties.name}</code> whose values (<code>&ldquo;{pv1.properties.args}&rdquo;</code> and <code>&ldquo;{pv2.properties.args}&rdquo;</code>) aren't valid.</em>
              </li>
            );
          
          else
            invalidCSSPseudo.push(
              <li>
                Multiple invalid pseudo-class values detected.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code>, <code className="selector pseudo-class">:{pv2.properties.name}</code> and {more} other(s) (like <code>&ldquo;{pv1.properties.args}&rdquo;</code> and <code>&ldquo;{pv2.properties.args}&rdquo;</code>) aren't valid.</em>
              </li>
            );
        }
        else {
          invalidCSSPseudo.push(
            <li>
              Unknown pseudo-class value detected.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code> whose value (<code>&ldquo;{pv1.properties.args}&rdquo;</code>) isn't valid.</em>
            </li>
          )
        }
      }
      
      if (invalidCSSPseudoElement) {
        invalidCSSPseudo.push(
          <li>
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
          <li>
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
              <li>
                Multiple unknown attributes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes both <code className="selector attrbute">{a1.properties.name}</code> and <code className="selector attribute">{a2.properties.name}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> If this is a custom attribute, you should prefix it with <code>&ldquo;data-&rdquo;</code> (like <code className="selector attribute">data-{a1.properties.name}</code>).</small>
              </li>
            );
          
          else
            invalidHTML.push(
              <li>
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
            <li>
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
            <li>
              Selectors should only ever include <strong>one</strong> type <em>or</em> universal selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes both <code className={t1Class}>{t1}</code> and <code className={t2Class}>{t2}</code>.</em>
            </li>
          );
          
        else
          invalid.push(
            <li>
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
            <li>
              Selectors should only ever include <strong>one</strong> unique<sup>&#8224;</sup> ID selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes both <code className="selector id">{id1}</code> and <code className="selector id">{id2}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> Note that repeating the same ID multiple times <em>is</em> valid.</small>
            </li>
          );
        
        else
          invalid.push(
            <li>
              Selectors should only ever include <strong>one</strong> ID selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector id">{id1}</code>, <code className="selector id">{id2}</code> and {more} other(s).</em>
              <br/>
              <small className="text-muted">Note that repeating the same ID multiple times <em>is</em> valid.</small>
            </li>
          );
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
          <p><i className="fa fa-warning"></i> This selector sequence is not valid <span className="alert-count">(<strong>{invalid.length} {errorCountText})</strong>):</span></p>
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
    
    if (!selectors || !selectors.elements || !selectors.elements.detailed || !selectors.elements.detailed.length)
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
      
      if (first.type === "combinator" && first.selector === " ")
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
      nextSuffix = undefined
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
              type = simpleSelector;
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
      
      if (pseudoElement)
        r.prefix = <span>This applies the <code className="selector pseudo-element">{pseudoElement.selector}</code> pseudo-element to</span>;
      else if (elements.length - index === elements.length)
        r.prefix = <span>This selects</span>
      
      if (type && type !== "*")
        r.type = <span>any <code className="selector type">&lt;{type}&gt;</code> element</span>;
      else
        r.type = <span>any element</span>;
        
      if (id)
        r.id = <span>whose unique <code>id</code> attribute is exactly <code className="selector id">{id}</code></span>
        
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
          pseudoClassText += ", and is subject to the";
          
        pseudoClasses.forEach(function(pseudoClass, index) {
          if (index > 0)
            pseudoClassText += (index === pseudoClasses.length - 1 ? " and" : ",")
            
          pseudoClassText += " <code class='selector pseudo-class'>" + pseudoClass.selector + "</code>";
        });
          
        pseudoClassText += " pseudo-class" + (pseudoClasses.length > 1 ? "es" : "");
          
        pseudoClassText = {__html: pseudoClassText};
        r.pseudoClasses = <span dangerouslySetInnerHTML={pseudoClassText}></span>;
      }
      
      r.elementRef = <span><small className="text-muted">(Element {elementRef})</small></span>;
      
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
        
        switch (combinator) {
          case " ":
            combinatorText = "a descendant of";
            break;
          case ">":
            combinatorText = "a direct child of";
            break;
          case "+":
            combinatorText = "the sibling next to";
            break;
          case "~":
            combinatorText = "any sibling of";
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
    var data = new core.SelectorsIO("div#foo[role=main] > *.bar:hover [href^=\"#\"]::before, div#foo[role=main] > *.bar:hover [href^=\"#\"]::after");
    data.changeActiveSelectorSequence(0);
    
    return {
      activeIndex: 0,
      input: "div#foo[role=main] > *.bar:hover [href^=\"#\"]::before, div#foo[role=main] > *.bar:hover [href^=\"#\"]::after",
      inputCooldownActive: false,
      data: data,
      canDeconstruct: false,
      sequences: data.selectorSequences,
      selectors: data.selectors
    }
  },
  
  handleUserInput: function(input) {
    this.setState({
      input: input
    })
    
    if (this.updateTimer) {
      window.clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    else {
      this.setState({
        inputCooldownActive: true,
        selectors: null
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
    else {
      deconstructionPane = (
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-info">
              <i className="fa fa-info"></i> Type or paste in any CSS selector into the textarea above.
            </div>
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