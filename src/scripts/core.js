var core = {};

core.SelectorsIO = function(selectorsGroup) {
  var self = this;
  this.hasMediaQuery = false;
  
  // We want to strip out any media queries and trailing } characters.
  selectorsGroup = selectorsGroup.replace(new RegExp("^@" + s._ident + "[^{]*", "gm"), function(match) {
    self.hasMediaQuery = match.match(new RegExp("^@" + s._ident, "g"))[0];
    return '';
  }).replace(/\}$/, '');
  
  if (this.hasMediaQuery)
    selectorsGroup = selectorsGroup.replace(/^\s*\{\s*/, '')
  
  this.selectorsGroup = s.stripNoise(selectorsGroup);
  this.selectorSequences = s.getSequences(this.selectorsGroup);
  this.selectors = {
    raw: [],
    elements: {
      raw: [],
      detail: []
    }
  }
}

core.SelectorsIO.prototype.changeActiveSelectorSequence = function(index) {
  if (!this.selectorSequences.length || !this.selectorSequences[index])
    return false;
    
  var
    sequence = this.selectorSequences[index],
    joinedSelectors,
    offset = 0,
    errorPos = 0,
    processingString = "",
    processingValid = true,
    processedArray = [],
    sequenceIsValid = true,
    elementArray
  ;  
  
  this.selectors.raw = s.getSelectors(sequence);
  
  joinedSelectors = this.selectors.raw.join('');
  
  for (var i = 0; i < (joinedSelectors.length > sequence.length ? joinedSelectors.length : sequence.length); i++) {
    var
      joined = joinedSelectors[i],
      original = sequence[i + offset]
    ;
    
    if (joined === original) {
      if (!processingValid) {
        processedArray.push({
          text: processingString,
          valid: processingValid
        });
        
        processingString = "";
        processingValid = true;
      }
      
      if (original)
        processingString += original;
      continue;
    }
      
    if (original === " " && joined !== " ") {
      offset++;
      i--;
      continue;
    }
    
    if (processingValid) {
      processedArray.push({
        text: processingString,
        valid: processingValid
      });
      
      processingString = "";
      processingValid = false;
    }
    
    if (original)
      processingString += original;
      
    offset++;
    i--;
    
    sequenceIsValid = false;
  }
  
  
  if (processingString)
    processedArray.push({
        text: processingString,
        valid: processingValid
    });
  
  this.selectors.invalidSequenceArray = sequenceIsValid ? null : processedArray;
  
  if (sequenceIsValid)
    elementArray = s.getElements(sequence)
  
  this.selectors.elements.raw = elementArray || null;
  this.selectors.elements.detailed = elementArray ? this.getElementDetails(elementArray) : null;
}

core.SelectorsIO.prototype.getElementDetails = function(elementArray) {
  var details = new Array(elementArray.length);
  
  elementArray.forEach(function(selectors, index) {
    details[index] = new Array(selectors.length);
    
    selectors.forEach(function(selector, subIndex) {
      var 
        type,
        namespace,
        isValid = false,
        properties = null
      ;
      
      try {
        var
          typeObj = s.getType(selector),
          selectorToValidate = selector
        ;
        
        type = typeObj.type;
        
        if (type === "type" || type === "universal")
          selectorToValidate = selector.replace(typeObj.namespace + "|", "");
        
        isValid = type === "combinator" || s.isValidSelector(selectorToValidate, true);
        
        if (type === "type" || type === "universal")
          namespace = typeObj.namespace;
        else if (type === "attribute")
          properties = s.getAttributeProperties(selector);
        else if (type === "pseudo-class" || type === "pseudo-element")
          properties = s.getPseudoProperties(selector);
      }
      catch (e) {
        type = "invalid";
      }
      
      try {
        if (type === "negation")
          properties = s.getNegationInnerSelectorProperties(selector);
      }
      catch (e) {
        isValid = false;
      }
      
      details[index][subIndex] = {
        selector: selector,
        type: type,
        namespace: namespace,
        isValid: isValid,
        properties: properties
      }
    });
  });
  
  return details;
}

core.SelectorsIO.prototype.generateSummaryFromSelector = function() {
  
}