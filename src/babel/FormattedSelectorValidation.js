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
        invalidCSSPseudoElement = null,
        lastType = "combinator"
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
             
        if (lastType !== "combinator" && (selector.type === "type" || selector.type === "universal"))
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
        
        lastType = selector.type;
      });
      
      if (invalidCSSPseudoClasses.length) {
        var  
          pc1 = invalidCSSPseudoClasses[0],
          footnote = (
            <small key={'cpcs' + index} className="text-muted"><sup>&#8224;</sup> Custom pseudo-classes must be prefixed with either <code>&ldquo;-name-&rdquo;</code> or <code>&ldquo;_name-&rdquo;</code> (like <code className="selector pseudo-class">:-custom-{pc1.properties.name}</code>).</small>
          )
        ;
        
        if (invalidCSSPseudoClasses.length > 1) {
          var
            pc2 = invalidCSSPseudoClasses[1],
            more = invalidCSSPseudoClasses.length > 2 ? invalidCSSPseudoClasses.length - 2 : false
          ;
        
          if (!more)
            invalidCSSPseudo.push(
              <li key={'cpc' + index}>
                Multiple unknown pseudo-classes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes unknown <code className="selector pseudo-class">:{pc1.properties.name}</code> and <code className="selector pseudo-class">{pc2.properties.name}</code> pseudo-classes.</em>
                <br/>
                {footnote}
              </li>
            );
          
          else
            invalidCSSPseudo.push(
              <li key={'cpc' + index}>
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
            <li key={'cpc' + index}>
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
              <li key={'cp' + index}>
                Multiple invalid pseudo-class values detected.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code> and <code className="selector pseudo-class">:{pv2.properties.name}</code> whose values (<code>&ldquo;{pv1.properties.args}&rdquo;</code> and <code>&ldquo;{pv2.properties.args}&rdquo;</code>) aren't valid.</em>
              </li>
            );
          
          else
            invalidCSSPseudo.push(
              <li key={'cp' + index}>
                Multiple invalid pseudo-class values detected.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code>, <code className="selector pseudo-class">:{pv2.properties.name}</code> and {more} other(s) (like <code>&ldquo;{pv1.properties.args}&rdquo;</code> and <code>&ldquo;{pv2.properties.args}&rdquo;</code>) aren't valid.</em>
              </li>
            );
        }
        else {
          invalidCSSPseudo.push(
            <li key={'cp' + index}>
              Unknown pseudo-class value detected.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector pseudo-class">:{pv1.properties.name}</code> whose value (<code>&ldquo;{pv1.properties.args}&rdquo;</code>) isn't valid.</em>
            </li>
          )
        }
      }
      
      if (invalidCSSPseudoElement) {
        invalidCSSPseudo.push(
          <li key={'cpe' + index}>
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
          <li key={'ht' + index}>
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
              <li key={'h' + index}>
                Multiple unknown attributes detected.<sup>&#8224;</sup>
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes both <code className="selector attrbute">{a1.properties.name}</code> and <code className="selector attribute">{a2.properties.name}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> If this is a custom attribute, you should prefix it with <code>&ldquo;data-&rdquo;</code> (like <code className="selector attribute">data-{a1.properties.name}</code>).</small>
              </li>
            );
          
          else
            invalidHTML.push(
              <li key={'h' + index}>
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
            <li key={'h' + index}>
              Unknown attribute detected.<sup>&#8224;</sup>
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes <code className="selector attribute">{a1.properties.name}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> If this is a custom attribute, you should prefix it with <code>&ldquo;data-&rdquo;</code> (like <code className="selector attribute">data-{a1.properties.name}</code>).</small>
            </li>
          )
        }
      }
      
      if (types.length) {
        var
          t1 = types[0].selector,
          t1Class = "selector " + types[0].type
        ;
        
        invalid.push(
          <li key={'type' + index}>
            The type or universal selectors must occur at the start of an element's selector.
            <br/>
            <em className="text-info">Element {currentElement}'s selector has <code className={t1Class}>{t1}</code> not at the start.</em>
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
            <li key={'id' + index}>
              Selectors should only ever include <strong>one</strong> unique<sup>&#8224;</sup> ID selector.
              <br/>
              <em className="text-info">Element {currentElement}'s selector includes both <code className="selector id">{id1}</code> and <code className="selector id">{id2}</code>.</em>
              <br/>
              <small className="text-muted"><sup>&#8224;</sup> Note that repeating the same ID multiple times <em>is</em> valid.</small>
            </li>
          );
        
        else
          invalid.push(
            <li key={'id' + index}>
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
              <li key={'invalid' + index}>
                Negation selectors must not contain other negation selectors or pseudo-element selectors.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes both <code className="selector negation">{n1.selector}</code> and <code className="selector negation">{n2.selector}</code>.</em>
              </li>
            );
          
          else
            invalid.push(
              <li key={'invalid' + index}>
                Negation selectors must not contain other negation selectors or pseudo-element selectors.
                <br/>
                <em className="text-info">Element {currentElement}'s selector includes <code className="selector negation">{n1.selector}</code> and <code className="selector negation">{n2.selector}</code> and {more} other(s).</em>
              </li>
            );
        }
        else {
          invalid.push(
            <li key={'invalid' + index}>
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
          <li key={'pe' + index}>
            Selectors should only ever include <strong>one</strong> pseudo-element selector.
            <br/>
            <em className="text-info">The selector sequence includes both <code className="selector pseudo-element">{pe1}</code> and <code className="selector pseudo-element">{pe2}</code>.</em>
          </li>
        );
      
      else
        invalid.push(
          <li key={'pe' + index}>
            Selector sequences should only ever include <strong>one</strong> pseudo-element selector.
            <br/>
            <em className="text-info">The selector sequence includes <code className="selector pseudo-element">{pe1}</code>, <code className="selector pseudo-element">{pe2}</code> and {more} other(s).</em>
          </li>
        );
    }
    
    if (pseudoNotAtEnd.length && pseudoElements.length === 1) {
      var pe = pseudoNotAtEnd[pseudoNotAtEnd.length - 1];
      
      invalid.push(
        <li key={'pne' + index}>
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