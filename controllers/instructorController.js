const Instructor = require("../models/instructorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  register_instructor: (req, res) => {
    Instructor.find({ email: req.body.email })
      .exec()
      .then(instructor => {
        if (instructor.length >= 1) {
          return res.status(409).json({
            message: "Email already exists in database."
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err
              });
            } else {
              const instructor = new Instructor({
                instructor_name: req.body.instructor_name,
                email: req.body.email,
                password: hash,
                classes: req.body.classId
              });
              instructor
                .save()
                .then(result => {
                  res.status(201).json({
                    message: "Instructor added.",
                    createdInstructor: instructor
                  });
                })
                .catch(err => {
                  res.status(422).json(err);
                });
            }
          });
        }
      });
  },

  login_instructor: (req, res) => {
    Instructor.findOne({ email: req.body.email })
      .exec()
      .then(instructor => {
        if (instructor.length < 1) {
          return res.status(401).json({
            message: "Auth failed."
          });
        }
        bcrypt.compare(
          req.body.password,
          instructor[0].password,
          (err, result) => {
            if (err) {
              return res.status(401).json({
                message: "Auth failed."
              });
            }
            if (result) {
              jwt.sign(
                {
                  email: instructor[0].email,
                  userId: instructor[0]._id
                },
                "secret",
                {
                  expiresIn: "1h"
                }
              );
              return res.status(200).json({
                message: "Auth successful",
                token: token
              });
            }
            res.status(401).json({
              message: " Auth failed"
            });
          }
        );
      })
      .catch(err => {
        res.status(500).json({
          err: err
        });
      });
  },

  delete_instructor: (req, res) => {
    Instructor.remove({
      _id: req.params.instructorId
    })
      .exec()
      .then(result => {
        res
          .status(200)
          .json({
            message: "Instructor deleted."
          })
          .catch(err => {
            res.status(422).json({
              err: err
            });
          });
      });
  }
};
