const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretOrKey = require("../../config/keys").secretOrKey;
const gravatar = require("gravatar");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load user model
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "users works" }));

// @route   GET api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body);

	// Check for valid input
	if (!isValid) {
		return res.status(400).json(errors);
	}

	// Find if the user email already exists
	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
			errors.email = "Email already exists";
			return res.status(400).json(errors);
		} else {
			const avatar = gravatar.url(req.body.email, {
				s: 200, // Avatar Size,
				r: "pg", // Rating
				d: "mm" // Default Avatar image
			});

			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				avatar
			});

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) throw err;
					newUser.password = hash;
					newUser
						.save()
						.then(user => res.json(user))
						.catch(err => console.log(err));
				});
			});
		}
	});
});

// @route   GET api/users/login
// @desc    User JWT Authentication
// @access  Public
router.post("/login", (req, res) => {
	const { errors, isValid } = validateLoginInput(req.body);

	// Check for valid input
	if (!isValid) {
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	const password = req.body.password;

	// User user by email
	User.findOne({ email }).then(user => {
		// Check for existing user
		if (!user) {
			errors.email = "User not found";
			return res.status(404).json(errors);
		}

		// Check password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				// User matched - Return the JWT for successful auth
				const payload = {
					id: user.id,
					name: user.name,
					avatar: user.avatar
				};

				jwt.sign(payload, secretOrKey, { expiresIn: "24h" }, (err, token) => {
					res.json({
						success: true,
						token: "Bearer " + token
					});
				});
				//return res.json({ msg: "User successfully logged in." });
			} else {
				errors.password = "Invalid password";
				return res.status(400).json(errors);
			}
		});
	});
});

// @route   GET api/users/current
// @desc    Return Current User
// @access  Private
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
	res.json({
		id: req.user.id,
		name: req.user.name,
		email: req.user.email,
		avatar: req.user.avatar
	});
});
module.exports = router;
