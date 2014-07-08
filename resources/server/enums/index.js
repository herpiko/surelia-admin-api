var states = {
  ACTIVE : "active",
  INACTIVE : "inactive",
}

var types = {
  MAILBOX : "mailbox",
  QUEUE : "queue",
  AV : "av",
  ANTISPAM : "antispam",
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
  States : build (states),
  Types : build (types)
}
