import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ISSUE_STATUS, ISSUE_CATEGORIES } from '../config/constants.js';

// Sub-schema for status history entries (audit trail)
const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: Object.values(ISSUE_STATUS),
            required: true
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            maxlength: 500,
            default: ''
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

// Sub-schema for comments
const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            maxlength: 500
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

// Sub-schema for image references
const imageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

// Main Issue schema
const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Issue title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Issue description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters']
        },
        category: {
            type: String,
            required: [true, 'Issue category is required'],
            enum: {
                values: ISSUE_CATEGORIES,
                message: '{VALUE} is not a valid category'
            }
        },
        status: {
            type: String,
            enum: Object.values(ISSUE_STATUS),
            default: ISSUE_STATUS.PENDING
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: [true, 'Location coordinates are required'],
                validate: {
                    validator: function (coords) {
                        if (!coords || coords.length !== 2) return false;
                        const [lng, lat] = coords;
                        return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
                    },
                    message: 'Invalid coordinates. Longitude must be -180 to 180, latitude -90 to 90'
                }
            },
            address: {
                type: String,
                trim: true,
                maxlength: 300
            }
        },
        images: {
            type: [imageSchema],
            validate: {
                validator: function (imgs) {
                    return imgs.length <= 5;
                },
                message: 'Maximum 5 images allowed per issue'
            },
            default: []
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reporter is required']
        },
        statusHistory: {
            type: [statusHistorySchema],
            default: []
        },
        comments: {
            type: [commentSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

// GeoJSON 2dsphere index for map-based geo queries
issueSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
issueSchema.index({ reporter: 1, createdAt: -1 });
issueSchema.index({ status: 1, category: 1 });
issueSchema.index({ createdAt: -1 });

// Apply pagination plugin
issueSchema.plugin(mongoosePaginate);

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
