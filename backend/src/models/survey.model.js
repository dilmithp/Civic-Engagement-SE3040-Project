import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  voteCount: {
    type: Number,
    default: 0
  }
});

const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Survey title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Survey description is required'],
      trim: true
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (val) => val.length >= 2,
        message: 'Survey must have at least 2 options'
      }
    },
    deadline: {
      type: Date,
      required: [true, 'Survey deadline is required']
    },
    targetAudience: {
      type: String,
      enum: ['all', 'citizen', 'official'],
      default: 'all'
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'expired'],
      default: 'active'
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: String,
      required: true
    },
    totalVotes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Auto-expire surveys past deadline
surveySchema.pre('find', function () {
  this.where({
    $or: [
      { status: { $ne: 'expired' } },
      { deadline: { $gt: new Date() } }
    ]
  });
});

const Survey = mongoose.model('Survey', surveySchema);
export default Survey;
