import mongoose from 'mongoose';

const surveyResponseSchema = new mongoose.Schema(
  {
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    selectedOptionIndex: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Enforce one vote per user per survey
surveyResponseSchema.index({ surveyId: 1, userId: 1 }, { unique: true });

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);
export default SurveyResponse;
