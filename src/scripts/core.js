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
    elementArray = s.getElements(sequence)
  ;  
  
  this.selectors.raw = s.getSelectors(sequence);
  this.selectors.elements.raw = elementArray;
  this.selectors.elements.detailed = this.getElementDetails(elementArray)
}

core.SelectorsIO.prototype.getElementDetails = function(elementArray) {
  var details = new Array(elementArray.length);
  
  elementArray.forEach(function(selectors, index) {
    details[index] = new Array(selectors.length);
    
    selectors.forEach(function(selector, subIndex) {
      var 
        type,
        isValid = false,
        properties = null
      ;
      
      try {
        type = s.getType(selector);
        isValid = type === "combinator" || s.isValidSelector(selector, true);
        
        if (type === "attribute")
          properties = s.getAttributeProperties(selector);
        else if (type === "pseudo-class" || type === "pseudo-element")
          properties = s.getPseudoProperties(selector);
      }
      catch (e) {
        type = "invalid";
      }
      
      details[index][subIndex] = {
        selector: selector,
        type: type,
        isValid: isValid,
        properties: properties
      }
    });
  });
  
  return details;
}

core.SelectorsIO.prototype.generateSummaryFromSelector = function() {
  
}