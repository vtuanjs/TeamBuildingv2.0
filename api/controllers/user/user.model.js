'use strict';
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const UserSchema = new Schema({
    email: { type: String, lowercase: true, match: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, unique: true, required: true },
    name: { type: String, default: "" },
    avata: String,
    gender: { type: String, enum: ["male", "female", "N/A"], default: "N/A" },
    phone: { type: String, default: "N/A" },
    address: { type: String, default: "N/A" },
    password: { type: String, required: true },
    role: { type: String, default: "user" }, //admin, user
    score: { type: Number, default: 0 },
    isActive: { type: Number, default: 1 },
    isBanned: { type: Number, default: 0 }, //1: banned
    projects: [{
        _id: { type: ObjectId, ref: "Project" },
        role: { type: String, default: "user" },
        isJoined: { type: Number, default: 1 },
    }],
    jobs: [{
        _id: { type: ObjectId, ref: "Job" },
        role: { type: String, default: "user" },
        isJoined: { type: Number, default: 1 },
    }],
    teams: [{
        _id: { type: ObjectId, ref: "Team" },
        role: { type: String, default: "user" },
        isJoined: { type: Number, default: 1 },
    }],
    comments: [{ type: ObjectId, ref: "Comment" }]
}, { timestamps: true, autoCreate: true })

const User = mongoose.model('User', UserSchema)
module.exports = User