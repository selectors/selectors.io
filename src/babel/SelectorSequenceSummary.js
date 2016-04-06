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
        r.id = <span> whose unique <code className="selector id">id</code> attribute is exactly <code>&ldquo;{id.replace('#', '')}&rdquo;</code></span>
        
      if (classes.length) {
        var classesText = "";
        
        if (id)
          classesText += ", and";
          
        classesText += " whose <code class='selector class'>class</code> attribute contains "
        
        classes.forEach(function(className, index) {
          if (index > 0)
            classesText += (index === classes.length - 1 ? " and " : ", ")
            
          classesText += "<code>&ldquo;" + className + "&rdquo;</code>";
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