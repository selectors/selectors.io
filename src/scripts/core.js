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
    elementArray
  ;
  
  this.selectors.raw = s.getSelectors(sequence);
  
  var validity = checkValidity(sequence, this.selectors.raw.join(''));
  
  this.selectors.invalidSequenceArray = validity.isInvalid ? validity.arr : null;
  
  if (!validity.isInvalid)
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

function checkValidity(stringIn, stringOut) {
  var
    r = {
      arr: [],
      isInvalid: false
    },
    str = "",
    valid = true,
    stringInLen = stringIn.length,
    stringOutLen = stringOut.length,
    offset = 0
  ;
  
  for (var i = 0; i< stringInLen; i++) {
    var
      charIn = stringIn[i],
      charOut = stringOut[i + offset],
      isCombinator = /[>+~]/.test(charIn)
    ;
  
    if (charIn === " " && charOut !== " ") {
      offset--;
      continue;
    }
    
    if (
      ((i === 0 || (stringInLen >= stringOutLen && i === stringInLen - 1)) && isCombinator)
      || (charIn !== charOut)
      || (i > 0 && isCombinator && /[>+~]/.test(stringIn[i-1]))
    ) {
      if (valid && str) {
        r.arr.push({ text: str, valid: valid });
        str = "";
      }
      
      r.isInvalid = true;
      valid = false;
      str += charIn;
      
      if (charIn !== charOut)
        offset--;
      continue;
    }
    
    if (!valid && str) {
      r.arr.push({ text: str, valid: valid });
      str = "";
    }
    
    valid = true;
    str += charIn;
  }
    
  if (str)
    r.arr.push({ text: str, valid: valid });
  
  return r;
}