import traverse from '../utils/traverse.js';
import warn from '../../core/utils/warn.js';

function setOne(doc, fieldPattern, fieldValue) {
  let method = fieldPattern.split('.').map((e) => {
    return e ? (e[0].toUpperCase() + e.slice(1)) : e;
  }).join('');

	// Permits for hijacking a get() with a translation.
  if(_.isFunction(Object.getPrototypeOf(doc)[`set${method}`])) {
    let set = Object.getPrototypeOf(doc)[`set${method}`];
    set.call(doc, fieldPattern, fieldValue);
		return;
  }

	return traverse(
		doc, fieldPattern,
		function(nestedDoc, nestedFieldName, field) {
			// If a field does not exist than we don't return anything.
			if (!field) {
				let Class = doc.constructor;
				warn(
					'["' + Class.getName() + '" class]["' + fieldPattern + '" field] ' +
					'Trying to set a value of the field that does not exist in the class'
				);
				return;
			}

			nestedDoc[nestedFieldName] = fieldValue;
		}
	);
};

export default setOne;
