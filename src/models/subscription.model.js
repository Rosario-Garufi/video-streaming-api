const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

//add index for search
subscriberSchema.index(
  {
    subscriber: 1,
    channel: 1,
  },
  { unique: true }
);

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
module.exports = Subscriber;
