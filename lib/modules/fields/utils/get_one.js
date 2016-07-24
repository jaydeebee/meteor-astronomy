import _ from 'lodash';
import traverse from '../utils/traverse.js';

function getOne(doc, fieldPattern, options) {
	// Prepare options.
	options = _.extend({
		transient: true,
		immutable: true
	}, options);

  // turns "nested.field.name" into "NestedFieldName"
	let method = fieldPattern.split(/[_\.]+/).map((e) => {
    return e ? (e[0].toUpperCase() +e.slice(1)) : e;
	}).join('');

  // Permits for hijacking a get() with a translation.
	if(_.isFunction(Object.getPrototypeOf(doc)[`get${method}`])) {
	  let get = Object.getPrototypeOf(doc)[`get${method}`];
	  let r = get.call(doc, fieldPattern, options);
	  if(r != undefined) {
	    return r;
	  }
	}

	// Permits for defaults
	if(_.isFunction(Object.getPrototypeOf(doc)[`default${method}`])) {
	  // replace the method String with a method reference
	  method = Object.getPrototypeOf(doc)[`default${method}`];
	} else {
	  method = null;
	}

	let r = traverse(
		doc, fieldPattern,
		function(nestedDoc, nestedFieldName, field) {
			// If a field does not exist than we don't return anything.
			if (!field) {
				return;
			}

			// Don't get a transient field.
			if (!options.transient && field.transient) {
				return;
			}

			// Don't get an immutable field.
			if (!options.immutable && field.immutable) {
				return;
			}

			// Just return a value.
			return nestedDoc[nestedFieldName];
		}
	);

	if(r == undefined && method) {
    r = method.call(doc, fieldPattern, options);
	}

	return r;
};

export default getOne;
