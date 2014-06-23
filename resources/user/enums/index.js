/**
 * User state
 * 
 */
var userStates = {
  PENDING : "pending", // pending
  ACTIVE : "active", // active
  INACTIVE : "inactive", // inactive
  UNKNOWN : "unknown", // inactive
  DELETED : "deleted", // deleted
}


function buildRoles (roles) {
  var o = {};
  Object.keys(roles).forEach(function(k){
    o[k.toUpperCase()] = { mask : roles[k].bitMask, title : roles[k].title };
  });
  return o;
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
module.exports = function (policy){
  return {
    Acl : policy.acl,
    Roles : build (buildRoles(policy.acl.userRoles), "title"),
    States : build (userStates),
    Bot : "surelia-admin@kodekreatif.co.id"
  }
}
