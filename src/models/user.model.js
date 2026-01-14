const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      index: true,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    coverImage: {
      public_id: String,
      url: String,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password must be at least 8 character'],
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },

    //channel specific field
    channelDescription: {
      type: String,
      default: '',
    },
    channelTags: {
      type: [String],
      default: [],
    },
    socialLinks: {
      x: String,
      instagram: String,
      facebook: String,
      website: String,
    },
    notificationSettings: {
      emailNotification: {
        type: Boolean,
        default: true,
      },
    },
    subscriptionActivity: {
      type: Boolean,
      default: true,
    },
    commentActivity: {
      type: Boolean,
      default: true,
    },
    //password refresh
    refreshPasswordToken: String,
    resetPasswordExpiry: String,
    //admin role
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
