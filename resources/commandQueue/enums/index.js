/**
 * Commands 
 * 
 */
var commands = {
  CREATE : "create",
  UPDATE : "update",
  DELETE : "delete",
}

/**
 * States 
 * 
 */
var states = {
  NEW : "new",
  STARTED : "started",
  FINISHED : "finished",
  FAILED : "failed"
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
  Commands : build (commands),
  States : build (states)
}
