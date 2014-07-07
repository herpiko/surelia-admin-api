/**
 * States 
 * 
 */
var states = {
  ACTIVE : "active",
  INACTIVE : "inactive",
}

/**
 * Build types and enum
 *
 */
function build (t, prop) {
  var o = { types : t, enum : []};
  Object.keys (t).forEach(function(k){
    if (prop) {
      o.enum.push (t[k][prop]);
    } else {
      o.enum.push (t[k]);
    }

  });
  return o;
}

/**
 * Expose the built module
 *
 */
module.exports = {
  States : build (states)
}
