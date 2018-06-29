/*
  Education FORM VALIDATION
*/

const Validator = require("validator");
const isEmpty = require("./is-empty");

// NOTE: All validation is string-based
module.exports = validateEducationInput = data => {
	let errors = {};

	// Convert empty object properties to empty string, and
	// Gracefully error out in case form is not submitted as
	// x-www-form-urlencoded
	data.school = !isEmpty(data.school) ? data.school : "";
	data.degree = !isEmpty(data.degree) ? data.degree : "";
	data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
	data.from = !isEmpty(data.from) ? data.from : "";

	// School Name required
	if (Validator.isEmpty(data.school)) {
		errors.school = "School Name is required";
	}

	// Degree required
	if (Validator.isEmpty(data.degree)) {
		errors.degree = "Degree is required";
	}

	// Field of Study required
	if (Validator.isEmpty(data.fieldofstudy)) {
		errors.fieldofstudy = "Field of Study is required";
	}

	// From Date required
	if (Validator.isEmpty(data.from)) {
		errors.from = "From Date is required";
	}

	return { errors, isValid: isEmpty(errors) }; // returns boolean based on errors object being empty or not
};
